angular
  .module(                                                      // create our primary module..
    'tempLogger',                                               // And name it 'tempLogger' - it'll be used in the angular template
    [
      'ngTable',                                                // Use the ngTable module to get a nice, sortable table
      'chart.js'                                                // Use the Angular-Chart module to interface with Chart.js
    ]
  )
  .controller('GraphCtrl',                                      // Create the controller GraphCtrl and reference it in the angular template
    function($scope,$http,NgTableParams) {                      // pull these into our controller
      var
        currentTime;                                            // `currentTime` is declared after the $http call, but also used in the tooltip rendering, so it needs to be in this scope

      $scope.options = {                                        // `$scope.options` is for Angular-Chart
        tooltips: {
          callbacks   : {
            title       : function(item) {                      // the default tooltip didn't work for our data, so this callback allows for more suitable rendering
              var
                minutesAgo = item[0].xLabel.match(/\d+/gi),     // Pull out the number from the default tooltip title with a little regexp
                timeOfItem;

              if (minutesAgo && minutesAgo[0]) {                // Do a check to make sure we have the correct information as not to throw a reference error
                minutesAgo = Number(minutesAgo[0]);             // Number-fy the results from the regexp
                timeOfItem = new Date(
                  currentTime - minutesAgo * 60000              // determine how many minutes ago the temperature reading occured - 60000 is the minute/microsecond conversion
                );
              }
              return timeOfItem;                                // Return it back for rendering
            },
            label  : function(tooltipItem) {
              return tooltipItem.yLabel +'°C';                  // Just add in the measurement unit
            }
          }
        }
      };

      $http
        .get([                                                  // Do a get request to our server
            'temperatures',                                     // I hate doing URL interpolation, so I'm using an array for each item, this case it's a literal
            new Date().getTime()-86400000,                      // The lower bound is 24 hours ago (24 hours = 86,400,000 milliseconds)
            new Date().getTime()                                // The current time
          ].join('/')                                           // join the array together with a slash to create the URL string
        )
        .then(function(temps) {                                 // Angular will return the result of the call in an object
          currentTime = new Date();                             // snag the current time as a Date object
          $scope.chartData = [                                  // Angular-chart expects the data to be in a nested array 
            temps.data.map(
              function(timeAndTemp) {
                return timeAndTemp[1];                          // map over the array because we only need the second part of each array (aka the temperature)
              }
            )
          ];
          $scope.chartLabels = temps.data.map(                  
            function(timeAndTemp) {                             // map over the data because we only need the labels (aka times)
              return '-' + Math.round(                          // format the labels to do a "minutes since" type of label
                  (currentTime - timeAndTemp[0]) / 60000        // 6000 is the millisecond/minute conversion
              ) + ' Mins';
            }
          );

          $scope.tableParams = new NgTableParams({}, {          // setup the ngTable options
            dataset: temps.data.map(function(timeAndTemp) {     // Again, we need to map over our data since it's not in the format ngTable wants
              return {
                time : new Date(timeAndTemp[0]),                // Time will be formatted by an Angular filter in the template   
                temp : timeAndTemp[1],
                timestamp : timeAndTemp[0]                      // The table is not displaying the timestamp, but we can use it for sorting!
              };
            })
          });
        })
        .catch(function(err) {                                  // Catch if the $http was unsuccessful
          console.log(err);                                     // Log it to the console, but in a production app you'd do more
        });
  });
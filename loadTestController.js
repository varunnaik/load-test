angular.module('loadTest', [])
    .controller('LoadTestController', ['$scope', '$http', '$timeout', '$location', function ($scope, $http, $timeout, $location) {
        // For each provided URL, spin off a test thread with a timeout
        // For each group of provided URLs, spin off n test threads with the given timeout
        var runningTests = [];
        var testURLs = [];
        var timeStarted = null;
        var runningTestTimeout = null;
        $scope.failedRequests = [];
        $scope.message = "";
        $scope.numErrors = 10;
        $scope.testRan = false;

        /* Test configuration */
        $scope.getFrequency = 1;
        $scope.numThreads = 2;
        $scope.timeout = 5000;
        $scope.timeElapsed = 1;
        $scope.randomString = false;


        /* ENTER THE URLS YOU WANT TO GET HERE, One Per Line. */
        $scope.urlsToPing = ""; // Use \n as a separator between URLs
        /* End URLS */


        /* Some test statistics */
        $scope.requestsMade = 0;
        $scope.requestsSuccess = 0;
        $scope.requestsFailure = 0;
        $scope.requestsIncomplete = 0;
        $scope.totalResponseTime = 0;
        $scope.transferredMB = 0;
        var transferredBytes = 0;

        if(/autostartLoadTest/.test($location.$$absUrl.split('?').pop())) {
            $scope.startTest();
        }

        $scope.startTest = function () {
            $scope.stopTest();
            $scope.testRan = false;
            $scope.failedRequests = [];
            $scope.requestsMade = 0;
            $scope.requestsSuccess = 0;
            $scope.requestsFailure = 0;
            $scope.requestsIncomplete = 0;
            $scope.totalResponseTime = 0;
            $scope.transferredMB = 0;
            transferredBytes = 0;
            timeStarted = new Date();		

            var urls = $scope.urlsToPing.split('\n');
            var addedUrls = false;
            for (var i = 0; i < urls.length; i++) {
				if (!urls[i]) continue;
				addedUrls = true;
                for (var j = 0; j < $scope.numThreads; j++) {
                    var urlConfig = {};
                    urlConfig.url = urls[i];
                    var index = runningTests.push(urlConfig) - 1;
                    urlConfig.id = index;
                    urlConfig.timeout = spawnTest(index);
                }
            }
            if (!addedUrls) {
				$scope.message = "No URLs found";
				$scope.stopTest();
                $scope.testStarted = false;
                $scope.configHidden = false;
			}
            
            runningTestTimeout = setInterval(function() {
				$scope.timeElapsed = parseInt((new Date() - timeStarted) / 1000);
			},1000);
            $scope.testRan = true;
        };

        $scope.stopTest = function () {
            // Iterate over every test and stop it
            while (runningTests.length >0) {
                var test = runningTests.pop();
                clearTimeout(test.timeout);
            }
            clearInterval(runningTestTimeout);
            runningTestTimeout = null;
        };

        var spawnTest = function (testIndex) {
            // Spawn tests
            if (typeof (runningTests[testIndex]) === 'undefined') return;
            $scope.requestsMade += 1;
            var startDate = new Date();
            var url = runningTests[testIndex].url;
            if ($scope.randomString) {
                url += '?' + Math.random().toString(36);
            }
            try {
                $http({
                    method: 'GET',
                    url: url,
                    timeout: $scope.timeout,
                    cache: false
                }).then(function success(data) {
                    $scope.requestsSuccess += 1;
                    if (data.headers('Content-Length')) {
                        transferredBytes += parseInt(data.headers('Content-Length'));
                        $scope.transferredMB = (transferredBytes / 1024 / 1024).toFixed(2);
                    }
                    $scope.totalResponseTime += new Date() - startDate;
                }, function error(error, status) {
                    $scope.requestsFailure += 1;
                    $scope.failedRequests.push({
                        url: url,
                        code: error.status,
                        details: error.statusText
                    });
                    console.log("Error", runningTests[testIndex].url, error);
                }).finally(function () {
                    runningTests[testIndex].timeout = $timeout(
                        function () {
                            spawnTest(testIndex);
                        }, $scope.getFrequency * 1000);
                });
            } catch (e) {
                $scope.failedRequests.push({
                    url: url,
                    code: e.name,
                    details: e.message
                });
            }
        };

    }]);

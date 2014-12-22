angular.module('loadTest', [])
    .controller('LoadTestController', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
        // For each provided URL, spin off a test thread with a timeout
        // For each group of provided URLs, spin off n test threads with the given timeout
        var runningTests = [];
        var testURLs = [];

        /* Test configuration */
        $scope.getFrequency = 1;
        $scope.numThreads = 2;
        $scope.timeout = 5000;
        $scope.urlsToPing = "/\n" +
        "/#/shop\n" +
        "/#/games\n" +
        "/#/crew\n" +
        "/#/viewer";

        /* Some test statistics */
        $scope.requestsMade = 0;
        $scope.requestsSuccess = 0;
        $scope.requestsFailure = 0;
        $scope.requestsIncomplete = 0;
        $scope.transferredBytes = 0;
        $scope.transferredBytes = 0;
        $scope.totalResponseTime = 0;

        $scope.startTest = function () {
            $scope.stopTest();

            $scope.requestsMade = 0;
            $scope.requestsSuccess = 0;
            $scope.requestsFailure = 0;
            $scope.requestsIncomplete = 0;
            $scope.transferredBytes = 0;
            $scope.transferredBytes = 0;
            $scope.totalResponseTime = 0;

            var urls = $scope.urlsToPing.split('\n');
            for (var i = 0; i < urls.length; i++) {
                for (var j = 0; j < $scope.numThreads; j++) {
                    var urlConfig = {};
                    urlConfig.url = urls[i];
                    var index = runningTests.push(urlConfig) - 1;
                    urlConfig.id = index;
                    urlConfig.timeout = spawnTest(index);
                }
            }

        };

        $scope.stopTest = function () {
            // Iterate over every test and stop it
            while (runningTests.length >0) {
                var test = runningTests.pop();
                clearTimeout(test.timeout);
            }
        };

        var spawnTest = function (testIndex) {
            // Spawn tests
            if (typeof (runningTests[testIndex]) === 'undefined') return;
            $scope.requestsMade += 1;
            $http({
                method: 'GET',
                url: runningTests[testIndex].url,
                timeout: $scope.timeout,
                cache: false
            }).then(function success(data,status) {
                $scope.requestsSuccess += 1;
            }, function error(error, status) {
                $scope.requestsFailure += 1;
            }).finally(function() {
                runningTests[testIndex].timeout = $timeout(
                    function() {
                        spawnTest(testIndex);
                    }, $scope.getFrequency*1000);
            });
        };

    }]);
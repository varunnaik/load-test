angular.module('loadTest', [])
.controller('LoadTestController', ['$scope', '$http', '$timeout', function($scope, $http, $timeout) {
        // For each provided URL, spin off a test thread with a timeout
        // For each group of provided URLs, spin off n test threads with the given timeout
        

        $scope.getFrequency = 1;
        $scope.numThreads = 2;
        $scope.urlsToPing = "https://airfi.aero/\n" +
        "https://airfi.aero/#/shop\n" +
        "https://airfi.aero/#/games\n" +
        "https://airfi.aero/#/crew\n" +
        "https://airfi.aero/#/viewer";

    }]);
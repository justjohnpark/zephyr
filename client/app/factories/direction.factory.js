(function() {
        angular
            .module('zephyr')
            .factory('DirectionFactory', DirectionFactory);

        function DirectionFactory($http, $q) {
            var factory = {};
            factory.apibase = "https://maps.googleapis.com/maps/api/directions/json?origin=";
            factory.apisuffix = "&mode=driving&key=AIzaSyAd0RUfc4XbIBhZ-cNdViFL2yronVellCc";

            factory.userLocation = undefined;
            factory.latitude = undefined;
            factory.longitude = undefined;
            factory.drivingETA = 0;

            factory.destination = "42.2125,-83.3533"; //DELETE THIS LATER

            factory.destLat = "42.2125";
            factory.destLong = "-83.8533";

            factory.drivingData = {};

            factory.getDrivingETAData = getDrivingETAData;
            factory.getDistance = getDistance;

            function getDistance() {
                formatUserLocation(factory.userLocation);
                console.log("LAT, LONG", factory.latitude, factory.longitude);
                var origin = new google.maps.LatLng(factory.latitude, factory.longitude);
                var destination = new google.maps.LatLng(factory.destLat, factory.destLong);
                var service = new google.maps.DistanceMatrixService();
                var deferred = $q.defer();
                var results;

                service.getDistanceMatrix(
                  {
                    origins: [origin],
                    destinations: [destination],
                    travelMode: google.maps.TravelMode.DRIVING,
                  }, callback);

                function callback(response, status) {
                    console.log('GOOGLE RESPONSE', response);
                    var routeData = response.rows[0].elements[0];
                    factory.drivingData.distance = routeData.distance.value;
                    factory.drivingData.duration = routeData.duration.value;
                    console.log('DRIVING DATA', factory.drivingData);
                }
                
                function distanceCallback(response, status) {
                    console.log('DISTANCE STATUS' + status);
                    if (status == google.maps.DistanceMatrixStatus.OK) {
                        var origins = response.originAddresses;
                        var destinations = response.destinationAddresses;

                        for (var i = 0; i < origins.length; i++) {
                            results = response.rows[i].elements;
                            for (var j = 0; j < results.length; j++) {
                                //factory.drivingData.element = results[j];
                                factory.drivingData.distance = results[j].distance.text;
                                factory.drivingData.duration = results[j].duration.text;
                                factory.drivingData.from = origins[i];
                                factory.drivingData.to = destinations[j];
                            }
                        }
                    }
                    console.log('DRIVING DATA:', factory.drivingData);
                    console.log(results);
                    deferred.resolve(results[0]);
                }
                return deferred.promise;
            }

        function getDrivingETAData() {
            var deferred = $q.defer();

            formatUserLocation(factory.userLocation);
            var url = factory.apibase;
            url = url + factory.latitude + "," + factory.longitude;
            url = url + "&destination=" + factory.destination;
            url = url + factory.apisuffix;

            $http.get(url).
            success(function(data, status, headers, config) {
                deferred.resolve(data);
                console.log(data.routes[0].legs[0].duration.text);
                factory.drivingETA = ((data.routes[0].legs[0].duration.value) / 60);
                factory.drivingETA = formatTimeAsUTC(factory.drivingETA);
                console.log(factory.drivingETA);
            }).error(function() {
                console.log('ERROR RETRIEVING DRIVING ETA');
                deferred.reject('ERROR DEFERRING DRIVING');
            });

            return deferred.promise;
        }

        function formatUserLocation(userLocation) {
            factory.latitude = String(Math.round(userLocation.coords.latitude * 10000) / 10000);
            factory.longitude = String(Math.round(userLocation.coords.longitude * 10000) / 10000);
        }

        function formatTimeAsUTC(input) {
            var now = new Date();
            var timeUTC = new Date(now.getTime() + (input * 60000));
            console.log(timeUTC);
            return timeUTC;
        }

        return factory;
    }
})();
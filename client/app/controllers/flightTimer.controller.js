(function(){
	angular
		.module('zephyr')
		.controller('flightTimer', flightTimer);

	function flightTimer(FlightFactory, ActivityFactory) {
		var vm = this;
		vm.FlightFactory = FlightFactory;
		vm.ActivityFactory = ActivityFactory;
		
		vm.currentPage = 1;
		vm.itemsPerPage = 1;
	}
})();
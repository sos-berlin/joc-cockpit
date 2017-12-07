/**
 * Created by sourabhagrawal on 24/10/17.
 */
(function () {
    'use strict';
    angular
        .module('app')
        .controller('YadeCtrl', YadeCtrl);

    YadeCtrl.$inject = ["$scope","YadeService"];
    function YadeCtrl($scope,YadeService) {
        var vm = $scope;
        var filter = {jobschedulerId: vm.schedulerIds.selected};
        vm.isLoading = false;
        filter.limit = parseInt(vm.userPreferences.maxRecords);
        YadeService.getTransfers(filter).then(function (res) {
            vm.yadeHistorys = res.transfers;
            vm.isLoading = true;
        }, function () {
            vm.isLoading = true;
        });

    }

})();

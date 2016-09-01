angular.module('app').run(['gettextCatalog', function (gettextCatalog) {
    gettextCatalog.setStrings('fr', {
        "About": "Sur"
    });

    gettextCatalog.setStrings('de', {
        "About": "Etwa"

    });
    gettextCatalog.setStrings('ja', {
        "About": "Etwa"

    });
}]);

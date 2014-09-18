angular
 .module('dockerUIv2')
 .controller('settingsCtrl', ['$scope', function($scope){
		$scope.title="Settings";
		$scope.items=['item1','item2','item3'];
 }])
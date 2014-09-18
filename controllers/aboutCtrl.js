angular
 .module('dockerUIv2')
 .controller('aboutCtrl', ['$scope', function($scope){
		$scope.title="About";
		$scope.items=['item1','item2','item3'];
 }])
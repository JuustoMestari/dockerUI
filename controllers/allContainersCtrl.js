angular
 .module('dockerUIv2')
 .controller('allContainersCtrl', ['$scope','containers','stringFactory',function($scope,containers,stringFactory){
		$scope.title="List of All Containers";
		
		angular.forEach(containers, function(container) {
			var uptime=container.State.FinishedAt;
			if(container.State.Running)uptime=container.State.StartedAt;
			//convert datetime to human readable
			container.State.StartedAt=stringFactory.getUptime(uptime);
			//container.ID=stringFactory.getShortId(container.ID,32);
		});
		$scope.containers=containers;
 }])
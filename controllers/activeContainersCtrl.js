angular
 .module('dockerUIv2')
 .controller('activeContainersCtrl', ['$scope','containers','stringFactory','notifFactory', function($scope,containers,stringFactory,notifFactory){
		
		$scope.title="List of Active Containers";
		if(notifFactory.checkNotifications(containers))return;
		angular.forEach(containers, function(container) {
			//convert datetime to human readable
			container.State.StartedAt=stringFactory.getUptime(container.State.StartedAt);

			//container.ID=stringFactory.getShortId(container.ID,32);
		});
		$scope.containers=containers;

 }])


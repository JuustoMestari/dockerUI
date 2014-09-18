angular
 .module('dockerUIv2')
 .controller('containerCtrl', ['$scope','$q','$http','$stateParams','$location','container','stringFactory','notifFactory','APIFactory', function($scope,$q,$http,$stateParams,$location,container,stringFactory,notifFactory,APIFactory){
		$scope.title="Container";
		$scope.container=container;
		if(notifFactory.checkNotifications(container))return;
		var timelabel="Down for";
		var uptime=container.State.FinishedAt;
		if($scope.container.State.Running)
			{
				timelabel="Up for";
				uptime=container.State.StartedAt;
			}
		
		//calculate number of exposed ports
		var portsExposed=0;
		angular.forEach(container.HostConfig.PortBindings, function(port) {
				portsExposed++;
			});
		var cfgportsExposed=0;
		angular.forEach(container.Config.ExposedPorts, function(port) {
				cfgportsExposed++;
			});
		console.log("PORT EXPOSED :"+portsExposed);
		console.log("CFG PORT EXPOSED :"+cfgportsExposed);
		$scope.ExposedPorts=container.HostConfig.PortBindings;
		if(portsExposed==0 && cfgportsExposed>0)$scope.ExposedPorts=container.Config.ExposedPorts;

		$scope.activeShowPorts=container.State.Running && portsExposed!=0;
		$scope.inactiveShowPorts=!container.State.Running && cfgportsExposed!=0;
		//info you want to display in container.html
		//each section is a different panel
		/*SummaryInfo*/
		$scope.summaryInfo=[["ID",container.ID],["Hostname",container.Config.Hostname],[timelabel,stringFactory.getUptime(uptime)]];
		/*NetworkInfo*/
		$scope.networkInfo=[["IPAddress",container.NetworkSettings.IPAddress+'/'+container.NetworkSettings.IPPrefixLen],["Gateway",container.NetworkSettings.Gateway]];

		$scope.startContainer=function(btn)
		{
			notifFactory.buttonLoading(angular.element(btn.target));
			APIFactory.startstopContainer($q,$http,container.ID,true,generateExposedPorts(cfgportsExposed)).then(function(response)
				{
					location.reload();
				},function(errorObj)
				{
					notifFactory.buttonLoaded(angular.element(btn.target),"Start");
					if(notifFactory.checkNotifications(errorObj))return;
				});
		};
		$scope.stopContainer=function(btn)
		{
			notifFactory.buttonLoading(angular.element(btn.target));
			APIFactory.startstopContainer($q,$http,container.ID,false,'').then(function(response)
				{
					location.reload();
				},function(errorObj)
				{
					notifFactory.buttonLoaded(angular.element(btn.target),"Stop");
					if(notifFactory.checkNotifications(errorObj))return;
				});
		};
		$scope.restartContainer=function(btn)
		{
			notifFactory.buttonLoading(angular.element(btn.target));
			APIFactory.restartContainer($q,$http,container.ID,false).then(function(response)
				{
					location.reload();
				},function(errorObj)
				{
					notifFactory.buttonLoaded(angular.element(btn.target),"Restart");
					if(notifFactory.checkNotifications(errorObj))return;
				});
		};
		$scope.deleteContainer=function(btn,delVolumes)
		{
			notifFactory.buttonLoading(angular.element(btn.target));
			APIFactory.deleteContainer($q,$http,container.ID,delVolumes).then(function(response)
				{
					$("#modalDeleteContainer").modal('hide');
					$(".modal-backdrop").remove();
					$location.path('allContainers');

				},function(errorObj)
				{
					$("#modalDeleteContainer").modal('hide');
					notifFactory.buttonLoaded(angular.element(btn.target),"Delete");
					if(notifFactory.checkNotifications(errorObj))return;
				});
		};
		//$scope.stopContainer=
 }]);

 /*Stop/Start container
-add loading gif in button
-run APIFactory method
-if fail -> display error
-stop loading gif
-if success -> reload page
 */
 function generateExposedPorts(ports)
 {
 	//{"PortBindings": {"80/tcp": [{"HostPort":"8080"}]}}
 	var generatedJson='{"PortBindings": {';
 	for(var i=0;i<ports;i++)
 	{
 		var hostSettings='[{"HostIp":"'+$("#HostIP"+i).val()+'","HostPort":"'+$("#HostP"+i).val()+'"}]';
 		if($("#HostIP"+i).val()=='' && $("#HostP"+i).val()=='')hostSettings='null';
 		generatedJson+='"'+$("#ContainerIP"+i).val()+'":'+hostSettings;
 		if(i!=(ports-1))generatedJson+=',';
 	}
 	generatedJson+='}}';
 	console.log(generatedJson);
 	return generatedJson;
 }
/*
*	API INFO
* docker -H tcp://0.0.0.0:4243 -api-enable-cors -H unix:///var/run/docker.sock -d &
*/
var APIAddress='http://123.123.123.123:4243/';
var APIversion='v1.10/';


var dockerUIv2Services=angular.module('dockerUIv2Services',['ngResource','ui.router']);

dockerUIv2Services.factory('stringFactory',
	function()
	{
		return {
			getUptime: function(thetime){
				return seconds2human(datetime2seconds(thetime));
				},
			getDate: function(thetime){
					var mydate=new Date(thetime);
					return mydate.toString("dd/MM/yyyy HH:mm ");
				},
			getShortId: function(str,size){
				return substr(str,size);
				},
			getHumanSize: function(size)
			{
				return getHumanReadableSize(size);
			},
			getAPIurl: function(isVersion)
			{
				var ver='';
				if(isVersion)ver=APIversion;
				return APIAddress+ver;
			}
		}
	});
dockerUIv2Services.factory('notifFactory',
	function()
	{
		var defaultNotifdiv="#notificationArea";
		return {
				checkNotifications: function(data)
				{
					//remove old notifications
					$(defaultNotifdiv).empty();
					//check if data contains errortype attribute
					if(!data.errorType)return false;
					this.createNotification(defaultNotifdiv,data.errorType,data.errorTitle,data.errorMsg);
					return true;
				},
				createNotification: function(divID,type,title,msg){
						 $(divID).html( '<div class="alert alert-'+type+' alert-dismissable"><button type="button" class="close" data-dismiss="alert" aria-hidden="true">&times;</button><b>'+title+'</b><pre>'+msg+'</pre></div>');
					},
				buttonLoading: function (btn)
	 			{
				 	btn.prop("disabled","disabled")
				 	btn.html(btn.attr("data-loading-text")+' <img src="img/loading.gif"/>');
	 			},
				buttonLoaded: function (btn,btnValue)
	 			{
				 	btn.prop("disabled",false)
				 	btn.html(btnValue);
	 			}	
			}
	});
dockerUIv2Services.factory('APIFactory',
	function()
	{
		return {
			getContainer: function($q,$http,containerID)
				{
					var deferred = $q.defer();
					$http.get(APIAddress+'containers/'+containerID+'/json').then(function(response) {
        			deferred.resolve(response.data);
      				},function(response)
      				{
      					
      					var errorObj={'isError':true,'errorType':'danger','errorMsg':"An error occured while retrieving the container !<br/><span class=\"glyphicon glyphicon-arrow-right\"></span> "+response.data+"<br/>"+addCheckDetails(response),'errorTitle':'Error'};
      					deferred.reject(errorObj);
      				});
      				return deferred.promise;
				},
			getContainers: function($q,$http,all)
				{
					var isAll='';
					if(all)isAll='?all=1';

					var deferred = $q.defer();

					var containerList=[];
					var i=0;
					//get all containers
					$http.get(APIAddress+APIversion+'containers/json'+isAll).then(function(response) {
						var j=response.data.length;
						if(j==0)
							{
								var errorObj={'isError':true,'errorType':'warning','errorMsg':"There is no active containers !",'errorTitle':'Warning'};
      							deferred.reject(errorObj);
							}
						angular.forEach(response.data,function(container,key)
						{
							$http.get(APIAddress+'containers/'+container.Id+'/json').then(function(response) {
								i++;
								containerList.push(response.data);
								//only resolve when all the data have been received
								if(i==(j))deferred.resolve(containerList);
							});
						},containerList);
      				},function(response)
      				{
      					console.log(response);
      					var errorObj={'isError':true,'errorType':'danger','errorMsg':"An error occured while retrieving containers. Status : "+response.status+"<br/>"+addCheckDetails(response),'errorTitle':'Error'};
      					deferred.reject(errorObj);
      				});
      				return deferred.promise;
				},
			startstopContainer: function($q,$http,containerID,isStart,portsJson)
				{
					var deferred = $q.defer();
					var startLabel="stop";
					if(isStart)startLabel="start";
					$http.post(APIAddress+'containers/'+containerID+'/'+startLabel,portsJson).then(function(response) {
        			deferred.resolve(response.data);
      				},function(response)
      				{	
      					var errorObj={'isError':true,'errorType':'danger','errorMsg':"An error occured while "+startLabel+"ing the container !<br/><span class=\"glyphicon glyphicon-arrow-right\"></span> "+response.data+"<br/>"+addCheckDetails(response),'errorTitle':'Error'};
      					deferred.reject(errorObj);
      				});
      				return deferred.promise;
				},
			restartContainer: function($q,$http,containerID)
				{
					var deferred = $q.defer();
					$http.post(APIAddress+'containers/'+containerID+'/restart').then(function(response) {
        			deferred.resolve(response.data);
      				},function(response)
      				{	
      					var errorObj={'isError':true,'errorType':'danger','errorMsg':"An error occured while restarting the container !<br/><span class=\"glyphicon glyphicon-arrow-right\"></span> "+response.data+"<br/>"+addCheckDetails(response),'errorTitle':'Error'};
      					deferred.reject(errorObj);
      				});
      				return deferred.promise;
				},
			getImages:function($q,$http)
				{
					var deferred = $q.defer();
					$http.get(APIAddress+'images/json').then(function(response) {
						console.log(response);
        			deferred.resolve(response.data);
      				},function(response)
      				{	
      					var errorObj={'isError':true,'errorType':'danger','errorMsg':"An error occured while retrieving images !<br/><span class=\"glyphicon glyphicon-arrow-right\"></span> "+response.data+"<br/>"+addCheckDetails(response),'errorTitle':'Error'};
      					deferred.reject(errorObj);
      				});
      				return deferred.promise;
				},
			createContainer:function($q,$http,hostname,image,cmd)
				{
					var deferred = $q.defer();
					$http.get('api/newContainer.json').then(function(response) {
						//create container here
						var jsonContainer=response.data;
						jsonContainer.Hostname=hostname;
						jsonContainer.Image=image;
						for(var i=0;i<cmd.length;i++)
							{
								console.log("LENGTH : "+cmd.length);
								console.log("val : "+cmd);
								jsonContainer.Cmd[i]=cmd[i];
							}
						$http.post(APIAddress+'containers/create',jsonContainer).then(function(response) {
								deferred.resolve(response.data);
						},function(response)
	      				{	
	      					var errorObj={'isError':true,'errorType':'danger','errorMsg':"An error occured while creating the container !<br/><span class=\"glyphicon glyphicon-arrow-right\"></span> "+response.data+"<br/>"+addCheckDetails(response),'errorTitle':'Error'};
	      					deferred.reject(errorObj);
	      				});
      				},function(response)
      				{	
      					var errorObj={'isError':true,'errorType':'danger','errorMsg':"An error occured while retrieving the json file !<br/><span class=\"glyphicon glyphicon-arrow-right\"></span> "+response.data+"<br/>"+addCheckDetails(response),'errorTitle':'Error'};
      					deferred.reject(errorObj);
      				});
      				return deferred.promise;
				},
			deleteContainer: function($q,$http,containerID,deleteVolumes)
				{
					var deleteVol="";
					if(deleteVolumes)deleteVol="?v=1";

					var deferred = $q.defer();
					$http.delete(APIAddress+'containers/'+containerID+deleteVol).then(function(response) {
        			deferred.resolve(response.data);
      				},function(response)
      				{	
      					var errorObj={'isError':true,'errorType':'danger','errorMsg':"An error occured while deleting the container !<br/><span class=\"glyphicon glyphicon-arrow-right\"></span> "+response.data+"<br/>"+addCheckDetails(response),'errorTitle':'Error'};
      					deferred.reject(errorObj);
      				});
      				return deferred.promise;
				},
			searchImage: function($q,$http,searchString)
				{
					var deferred = $q.defer();
					$http.get(APIAddress+'images/search?term='+searchString).then(function(response) {
        			deferred.resolve(response.data);
      				},function(response)
      				{
      					var errorObj={'isError':true,'errorType':'danger','errorMsg':"An error occured while searching for -"+searchString+"- !<br/><span class=\"glyphicon glyphicon-arrow-right\"></span> "+response.data+"<br/>"+addCheckDetails(response),'errorTitle':'Error'};
      					deferred.reject(errorObj);
      				});
      				return deferred.promise;
				},
			listImages: function($q,$http)
				{
					var deferred = $q.defer();

					var imageList=[];
					var i=0;
					//get all containers
					$http.get(APIAddress+APIversion+'images/json?all=0').then(function(response) {
						var j=response.data.length;
						if(j==0)
							{
								var errorObj={'isError':true,'errorType':'warning','errorMsg':"There is no image !",'errorTitle':'Warning'};
      							deferred.reject(errorObj);
							}
						angular.forEach(response.data,function(image)
						{
							$http.get(APIAddress+APIversion+'images/'+image.Id+'/json').then(function(response) {
								i++;
								//add extra attributes which aren't in the inspect response
								response.data.Size=image.Size;
								response.data.VirtualSize=image.VirtualSize;
								response.data.RepoTags=image.RepoTags;
								response.data.Created=image.Created;
								imageList.push(response.data);
								//only resolve when all the data have been received
								if(i==(j))deferred.resolve(imageList);
							});
						},imageList);
      				},function(response)
      				{
      					console.log(response);
      					var errorObj={'isError':true,'errorType':'danger','errorMsg':"An error occured while retrieving images. Status : "+response.status+"<br/>"+addCheckDetails(response),'errorTitle':'Error'};
      					deferred.reject(errorObj);
      				});
      				return deferred.promise;
				}
			}
	});

//convert seconds to elapsed time in seconds,minutes, hours and days.
function seconds2human(seconds)
{
	 	//seconds-=7200;
	 	/*var running="Down for ";
	 	if (isRunning)running="Up for ";*/
		var s = seconds % 60;
		var m = (Math.floor((seconds%3600)/60)>0)?Math.floor((seconds%3600)/60)+'min':'';
		var h = (Math.floor((seconds % 86400) / 3600)>0)?Math.floor((seconds % 86400) / 3600)+'h':'';
		var d = (Math.floor((seconds % 2592000) / 86400)>0)?Math.floor((seconds % 2592000) / 86400)+'d':'';
		var M = (Math.floor(seconds / 2592000)>0)?Math.floor(seconds / 2592000)+'months':'';
		if(Math.floor((seconds % 60)<60) && m=='' && h=='' && d=='')return s+" sec";
		if(Math.floor((seconds%3600)/60)<60 &&  d=='')return h+' '+m;
		return d+' '+h;
}

//convert string datetime into seconds
function datetime2seconds(strDateTime)
{
	var plop = new Date();
    plop.setFullYear(strDateTime.substr(0, 4));
    plop.setMonth(strDateTime.substr(5, 2) - 1);
    plop.setDate(strDateTime.substr(8, 2));
    plop.setHours(strDateTime.substr(11, 2));
    plop.setMinutes(strDateTime.substr(14, 2));
	var elapsed = Date.now()-plop;
	return elapsed/1000;
}

//cut a part of a string (used mainly for containerID)
function substr(str,size)
{
	return str.substr(0,size);
}

function addCheckDetails(apiResponse)
{
	console.log(apiResponse);
	return "<b>Check : </b><br/><ul><li>The API URL ( <a target=\"_blank\" href=\""+apiResponse.config.url+"\">"+apiResponse.config.url+"</a> )</li><li>Google Chrome Console for more details</li></ul>";
}

function getHumanReadableSize(bytes)
{
	//source : http://stackoverflow.com/questions/3758606/how-to-convert-byte-size-into-human-readable-format-in-java
	var unit = 1000;
    if (bytes < unit) return bytes + " B";
    var exp = (Math.log(bytes) / Math.log(unit));
    var pre = ("kMGTPE").charAt(exp-1) + "";
    return (bytes / Math.pow(unit, Math.floor(exp))).toFixed(2)+ pre+'B';
}
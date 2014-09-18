

var dockerUIv2=angular
.module('dockerUIv2',[
"ui.router",
"dockerUIv2Services",
"ngResource"
]);

dockerUIv2.config(['$urlRouterProvider','$stateProvider','$httpProvider', function($urlRouterProvider,$stateProvider,$httpProvider) {

	//Allow cross domain requests for API
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common["X-Requested-With"];
	$urlRouterProvider.otherwise('activeContainers');
	$stateProvider
		.state('dashboard',{
			url: '/',
			templateUrl: 'templates/dashboard.html',	
			controller: 'dashboardCtrl'
		})
		.state('dashboard.activeContainers',{
			url: 'activeContainers',
			templateUrl: 'templates/activeContainers.html',
			controller: 'activeContainersCtrl',
			resolve: {
				containers: ['APIFactory','$q','$http', function(APIFactory,$q,$http){
					return APIFactory.getContainers($q,$http,false).then(function(response)
						{
							return response;
						},function(errorObj)
						{
							return errorObj;
						});
				}]
			}
		})
		.state('dashboard.allContainers',{
			url: 'allContainers',
			templateUrl: 'templates/allContainers.html',
			controller: 'allContainersCtrl',
			resolve: {
				containers: ['APIFactory','$q','$http', function(APIFactory,$q,$http){
					return APIFactory.getContainers($q,$http,true).then(function(response)
						{
							return response;
						},function(errorObj)
						{
							return errorObj;
						});
				}]
			}
		})
		.state('dashboard.activeContainers.instance-container',{
			parent:'dashboard',
			url: 'container/{containerID:[0-9a-f]{64}}',
			templateUrl: 'templates/container.html',
			controller: 'containerCtrl',
			resolve: {
				container: ['APIFactory','$q','$http','$stateParams', function(APIFactory,$q,$http,$stateParams){
					return APIFactory.getContainer($q,$http,$stateParams.containerID).then(function(response)
						{
							return response;
						},function(errorObj)
						{
							return errorObj;
						});
				}]
			}
		})
		.state('dashboard.allContainers.instance-container',{
			parent:'dashboard',
			url: 'container/{containerID:[0-9a-f]{64}}',
			templateUrl: 'templates/container.html',
			controller: 'containerCtrl',
			resolve: {
				container: ['APIFactory','$q','$http','$stateParams','$location', function(APIFactory,$q,$http,$stateParams,$location){
					return APIFactory.getContainer($q,$http,$stateParams.containerID).then(function(response)
						{
							return response;
						},function(errorObj)
						{
							return errorObj;
						});
				}]
			}
		})
		.state('dashboard.newContainer',{
			url: 'new',
			templateUrl: 'templates/newContainer.html',
			controller: 'newContainerCtrl',
			resolve: {
				images: ['APIFactory','$q','$http','$location', function(APIFactory,$q,$http,$location){
					return APIFactory.getImages($q,$http).then(function(response)
						{
							return response;
						},function(errorObj)
						{
							return errorObj;
						});
				}]
			}
		})
		.state('dashboard.searchImage',{
			url: 'searchImage',
			templateUrl: 'templates/searchImage.html',
			controller: 'searchImageCtrl'
		})
		.state('dashboard.allImages',{
			url: 'allImages',
			templateUrl: 'templates/allImages.html',
			controller: 'allImagesCtrl',
			resolve: {
				images: ['APIFactory','$q','$http', function(APIFactory,$q,$http){
					return APIFactory.listImages($q,$http).then(function(response)
						{
							return response;
						},function(errorObj)
						{
							return errorObj;
						});
				}]
			}
		})
		.state('settings',{
			url: '/settings',
			templateUrl: 'templates/settings.html',
			controller: 'settingsCtrl'
		})
		.state('about',{
			url: '/about',
			templateUrl: 'templates/about.html',
			controller: 'aboutCtrl'
		})
		.state('help',{
			url: '/help',
			templateUrl: 'templates/help.html',
			controller: 'helpCtrl'
		})
		
}]);

function emtpyNotif()
{
	$("#notificationArea").empty();
}
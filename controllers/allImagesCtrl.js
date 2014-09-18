angular
 .module('dockerUIv2')
 .controller('allImagesCtrl', ['$scope','$q','$http','$location','APIFactory','notifFactory','stringFactory', 'images', function($scope,$q,$http,$location,APIFactory,notifFactory,stringFactory,images){
		$scope.title="Images";

		angular.forEach(images, function(image) {
		image.VirtualSize=stringFactory.getHumanSize(image.VirtualSize);
		image.created=stringFactory.getDate(image.created);
		});
		$scope.images=images;
		

		
 }])

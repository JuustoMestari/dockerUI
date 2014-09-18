angular
 .module('dockerUIv2')
 .controller('newContainerCtrl', ['$scope','$q','$http','$location','APIFactory','notifFactory','stringFactory', 'images', function($scope,$q,$http,$location,APIFactory,notifFactory,stringFactory,images){
		$scope.title="New Container";
		angular.forEach(images, function(image) {
			image.Created=stringFactory.getHumanSize(image.Created);
			image.Size=stringFactory.getHumanSize(image.Size);
			image.VirtualSize=stringFactory.getHumanSize(image.VirtualSize);
		});
		$scope.images=images;
		if(notifFactory.checkNotifications(images))return;


		$("#commandInput").tooltip();

		$scope.createContainer=function(btn)
		{
			//use HTML5 validator for "required" fields
			if(!$('#formCreateContainer')[0].checkValidity())
			{
				$('#formCreateContainer .submit').click();
				return;
			}

			notifFactory.buttonLoading(angular.element(btn.target));

			APIFactory.createContainer($q,$http,$(containerNameInput).val(),$(containerImageInput).val(),$(commandInput).val().split(',')).then(function(response)
				{
					$location.path( "container/"+response.Id );
				},function(errorObj)
				{
					notifFactory.buttonLoaded(angular.element(btn.target),"Create");
					if(notifFactory.checkNotifications(errorObj))return;
				});
		};
 }])

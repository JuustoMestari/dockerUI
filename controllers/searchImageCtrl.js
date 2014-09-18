angular
 .module('dockerUIv2')
 .controller('searchImageCtrl', ['$scope','$q','$http','$location','APIFactory','notifFactory','stringFactory',  function($scope,$q,$http,$location,APIFactory,notifFactory,stringFactory){
		$scope.title="Search Image";
		$scope.resultsPerPage=20;

		$scope.start=0;
		$scope.end=20;

		$scope.displayResults=false;
		$scope.isDownloading=false;
		$scope.downloadInfo="";
		$scope.pullBtn="";


		$scope.searchImage=function(btn,searchString)
		{
			$("#searchImageNotification").empty();
			//use HTML5 validator for "required" fields
			if(!$('#formSearchImage')[0].checkValidity())
			{
				$('#formSearchImage .submit').click();
				return;
			}
			$scope.displayResults=false;
			notifFactory.buttonLoading(angular.element(btn.target));

			APIFactory.searchImage($q,$http,searchString).then(function(response)
				{
					
					$scope.searchString=searchString;
					$scope.imagesResults=response;
					$scope.paginationButtons=new Array(Math.ceil($scope.imagesResults.length/$scope.resultsPerPage));
					if($scope.imagesResults.length==0)
					{
						notifFactory.createNotification("#searchImageNotification","info","Info : ","No image found !");
					}
					else
					{
						$scope.displayResults=true;
					}
					
					notifFactory.buttonLoaded(angular.element(btn.target),"Search");
				},function(errorObj)
				{
					notifFactory.buttonLoaded(angular.element(btn.target),"Search");
					if(notifFactory.checkNotifications(errorObj))return;
				});
		};
		$scope.pullImage=function(btn,imageName)
		{
			$scope.pullBtn=btn;
			notifFactory.buttonLoading(angular.element(btn.target));
			var xhr = new XMLHttpRequest();
			xhr.open("POST", stringFactory.getAPIurl(true)+"images/create?fromImage="+imageName, true);
			xhr.send();
			$("html, body").animate({ scrollTop: 0 }, "slow");
			xhr.onprogress = function () {
				if(xhr.responseText!="")
				{

					$scope.isDownloading=true;
					var splitResponse = xhr.responseText.split("}{");

					//make sure to get only the last json string
					var lastInfo='{'+splitResponse[splitResponse.length-1];

					$scope.downloadInfo=angular.fromJson(lastInfo);

					if($scope.downloadInfo.error)
					{
						notifFactory.createNotification("#searchImageNotification","danger","Error ! ",$scope.downloadInfo.error);
						return;
					}

					$scope.$apply(function()
					{
						$scope.getDownloadStatus=$scope.downloadInfo.status;
						$scope.isDownloading=true;
					});
					if($scope.downloadInfo.progressDetail.current)
					{
						$scope.sizeStatus = ' [ '+stringFactory.getHumanSize($scope.downloadInfo.progressDetail.current)+'/'+stringFactory.getHumanSize($scope.downloadInfo.progressDetail.total)+' ] ';
						$scope.$apply(function()
						{	
							$scope.getDownloadStatus=$scope.downloadInfo.status+$scope.sizeStatus;
							$scope.downloadPercent=Math.floor(($scope.downloadInfo.progressDetail.current/$scope.downloadInfo.progressDetail.total)*100)+"%";
						});
					}
			
					console.log($scope.downloadInfo);
				}

			};
			xhr.onload = function(){
				$scope.$apply(function()
				{	
					$scope.isDownloading=false;
				});
				notifFactory.buttonLoaded(angular.element($scope.pullBtn.target),"Pulled !");	
			};
		};
		$scope.goToPage=function(page)
		{
			$scope.start=(page-1)*$scope.resultsPerPage;
			$scope.end=(page)*$scope.resultsPerPage;
			updatePagination(Math.ceil($scope.imagesResults.length/$scope.resultsPerPage),page);
			
		};

 }])
.filter('slice',function()
{
	return function(arr,start,end)
	{
		if(!arr)return 0;
		return arr.slice(start,end);
	}
});

function updatePagination(maxPage,currentpage)
{
	for(var i=0;i<maxPage;i++)$(".page_"+(i+1)).attr('class','page_'+(i+1));
	$(".page_"+currentpage).attr('class','page_'+(currentpage)+' active');
}

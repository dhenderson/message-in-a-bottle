var app = angular.module('MiaB', ['firebase', 'ngRoute']);

// routes
app.config(['$routeProvider',
	function($routeProvider) {
		$routeProvider.
    		when('/messages', {
      		  templateUrl: '/templates/messages.html',
      		  controller: 'MessagesController'
    		}).
    		when('/message/:messageId', {
      		  templateUrl: '/templates/message.html',
      		  controller: 'MessageController'
    		}).
    		when('/compose', {
      		  templateUrl: '/templates/compose.html',
      		  controller: 'ComposeController'
    		}).
	        otherwise({
	          redirectTo: '/messages'
	        });
}]);

// All messages controller
app.controller('MessagesController', function($scope, $firebaseArray) {
    var messageRef = new Firebase("https://message-in-a-bottle.firebaseio.com/messages/");
    messages = $firebaseArray(messageRef);
	$scope.messages = messages;
	
	// calculate the opacity of a message based on its view count
	$scope.getOpacity = function(message){
		return (10-message.readCount)/10;
	}
	
	$scope.getContentPreview = function(message){
		lengthLimit = 50;
		contentPreview = message.content.substring(0, lengthLimit);
		
		if (message.content.length > lengthLimit){
			contentPreview += "...";
		}
		return contentPreview;
	}
});

// Single message controller
app.controller('MessageController', function($scope, $firebaseObject, $routeParams, $firebase, $location) {
	// get the message ID
	var messageId = $routeParams.messageId;
	
	var firebaseUrl = "https://message-in-a-bottle.firebaseio.com/messages/" + messageId;

    var messageRef = new Firebase(firebaseUrl);
    message = $firebaseObject(messageRef);
	$scope.message = message;
	$scope.showDestoryMessageOption = false;
	
	message.$loaded().then(function(){
		// Note since Angular 1.4 controllers are loaded twice, 
		// meaning we really increment twice. To create an increment
		// of one, therefore we update by 0.5.
		message.readCount += 0.5;
		message.$save();
		
		// if the read count gets to 10, destroy it
		if (message.readCount >= 10){
			// destroy the message
			message.$remove();
			
			// redirect as this message no longer exists
			$location.path("/messages");
		}
		
		
		// for small messages, allow users to delete them right away
		// rather than waiting for the view limit
		if (message.content.length < 125){
			$scope.showDestoryMessageOption = true;
		}
	});
	
	$scope.getPercentComplete = function(){
		var percentComplete = message.readCount * 10;
		return percentComplete;
	}
	
	$scope.destroyMessage = function(){
		if($scope.showDestoryMessageOption == true){
			message.$remove();
			// this message no longer exists, so redirect to /messages
			$location.path("/messages");
		}
	}
});

// Compose controller
app.controller('ComposeController', function($scope, $firebaseObject, $firebaseArray, $location) {
    var messageRef = new Firebase("https://message-in-a-bottle.firebaseio.com/messages/");
    messages = $firebaseArray(messageRef);
	$scope.messages = messages;	
	
	// create new message
	$scope.newMessage = function(){
		if ($scope.newContent != null){
			date = Date.now();
			messages.$add({
				date : date,
				content : $scope.newContent,
				readCount: 0
			});
			$scope.message = null;
			
			// redirect back to all messages
			$location.path("/messages");
		}
	}
});
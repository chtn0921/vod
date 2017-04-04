app.factory('auth', ['$http', '$window', '$state',
function($http, $window, $state) {
	var auth = {};

	auth.saveToken = function(token) {
		$window.localStorage['vod-auth-token'] = token;
	};

	auth.getToken = function() {
		return $window.localStorage['vod-auth-token'];
	};

	auth.logOut = function() {
		$window.localStorage.removeItem('vod-auth-token');
		$state.go('login');
	};

	auth.isLoggedIn = function() {
		var token = auth.getToken();
		if ( (token != 'undefined') && (token != null) && (token != "")  ) {			
			//console.log(" auth.isLoggedIn token : ",token );	
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			return payload.exp > Date.now() / 1000;
		} else {
			return false;
		}
	};

	auth.currentUser = function() {
		if (auth.isLoggedIn()) {
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));

			return payload.username;
		}
	};

	auth.register = function(user) {
		return $http.post('/register', user).then(function(data) {
			console.log("data.token saved on register : ",data.data.token);
			auth.saveToken(data.data.token);
		});
	};

	auth.logIn = function(user) {
		return $http.post('/login', user).then(function(data) {
			console.log("data.token saved on login : ",data.data.token);
			auth.saveToken(data.data.token);
		});
	};

	return auth;
}]);

app.factory('posts', ['$http', 'auth',
function($http, auth) {
	var o = {
		posts : [],		
		myhistory : []
	};

	o.getAll = function() {
		//console.log("callinbg getAll");
		var movies = [];
		
		return $http({
	        method : "GET",
	        url : 'https://demo2697834.mockable.io/movies'
	    }).then(function mySucces(response) {	       
	       //console.log("Start Getting movies :: ",(response.data.entries && ( response.data.entries.length > 0 ) ));
	       if(response.data.entries && ( response.data.entries.length > 0 ) ){
	       		var start = 0;
	       		var i = 0;
	       		response.data.entries.forEach( function(entry){
	       			if((i!= 0) && (i%4 == 0)){
				    	start++;
				    }
				    if(movies[start]){
				    	movies[start].push(entry);	
				    } else {
				    	movies[start] = new Array(entry);
				    }					
					i++;
				});
	       }
	       //console.log("Getting movies :: ",movies);
	       angular.copy(movies, o.posts);	       
	       //return response;
	       return o.posts;
	    }, function myError(response) {
	       console.log("Error Response :: ",response);
	       return response;
	    });	    
	};
	//now we'll need to create new posts
	//uses the router.post in index.js to post a new Post mongoose model to mongodb
	//when $http gets a success back, it adds this post to the posts object in
	//this local factory, so the mongodb and angular data is the same
	//sweet!

	o.addToUserHistory = function(movie_id){
		return $http.post('/history', movie_id, {
		    headers: {Authorization: 'Bearer '+auth.getToken()}
		}).then(function(response){
		  	console.log("after  : ",response.data);
		    o.posts.push(response.data);
		});	
	};

	o.getUserHistory = function(){
		console.log("o.getUserHistory token :: ",auth.getToken());
		return $http.get('/myhistory',{
				    headers: {Authorization: 'Bearer '+auth.getToken()}
				}).then(function(response){
				  	//console.log("after fetching in user history  : ",response.data);					
					return response.data;
				}, function(error){
					//console.log("Error fetching in user history",error);	
					return error;			
				});	
	};
	return o;
}]);
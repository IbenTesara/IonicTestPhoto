// Ionic Starter App
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
angular.module('starter', ['ionic', 'ngCordova', 'ngCordovaOauth', 'auth0', 'angular-storage', 'auth0.lock', 'angular-jwt', 'auth0.auth0']).config(function (lockProvider, angularAuth0Provider) {
    lockProvider.init({
        clientID: 'e2vma2Adqgn7Ioyl9nOOzRWnzd0jb0MZ'
        , domain: 'ibenvandeveire.eu.auth0.com'
    });
    angularAuth0Provider.init({
        clientID: 'e2vma2Adqgn7Ioyl9nOOzRWnzd0jb0MZ'
        , domain: 'ibenvandeveire.eu.auth0.com'
    })
}).value('GoogleApp', {
    apiKey: ' AIzaSyDBkcSDlXBhTDyve8f7LTA3tRn6fSxPZFk '
    , clientID: ' 774519058481-irk8dpphk21ifrvjb29kct97rfkc2mf7.apps.googleusercontent.com '
    , scopes: [
        'https://www.googleapis.com/auth/drive'
    ]
}).run(function ($ionicPlatform, authService, $rootScope, lock) {
    $rootScope.authService = authService;
    authService.registerAuthenticationListener();
    authService.authenticateAndGetProfile();
    lock.interceptHash();
    $ionicPlatform.ready(function () {
        if (window.cordova && window.cordova.plugins.Keyboard) {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            // Don't remove this line unless you know what you are doing. It stops the viewport
            // from snapping when text inputs are focused. Ionic handles this internally for
            // a much nicer keyboard experience.
            cordova.plugins.Keyboard.disableScroll(true);
        }
        if (window.StatusBar) {
            StatusBar.styleDefault();
        }
    });
}).service('authService', function (lock, authManager, angularAuth0, $location, $rootScope) {
    function login() {
        lock.show();
    }

    function registerAuthenticationListener() {
        lock.on('authenticated', function (authResult) {
            localStorage.setItem('id_token', authResult.idToken);
            authManager.authenticate();
            gapi.auth.setToken(authManager.getToken());
        });
    }

    function authenticateAndGetProfile() {
        var result = angularAuth0.parseHash(window.location.hash);
        if (result && result.idToken) {
            localStorage.setItem('id_token', result.idToken);
            authManager.authenticate();
            angularAuth0.getProfile(result.idToken, function (error, profileData) {
                if (error) {
                    console.log(error);
                }
                localStorage.setItem('profile', JSON.stringify(profileData));
            });
        }
        else if (result && result.error) {
            alert('error: ' + result.error);
        }
    }

    function googleLogin(callback) {
        angularAuth0.login({
            connection: 'google-oauth2'
            , responseType: 'token'
        }, callback);
    }
    return {
        login: login
        , registerAuthenticationListener: registerAuthenticationListener
        , googleLogin: googleLogin
        , authenticateAndGetProfile: authenticateAndGetProfile
    }
}).controller('CanvasCTRL', function ($scope, $cordovaCamera, $cordovaEmailComposer, $window, store, $location, auth, authService, $rootScope, $log, authManager, $timeout,Drive) {
    console.log($rootScope.isAuthenticated);
    $scope.login = function () {
        console.log("Hello");
        authService.googleLogin(function (err) {
            if (err) {
                $log.info("something went wrong: " + err.message);
            }
            else {
                console.log("Logged in");
                authManager.authenticate();
            }
        });
    };
    //PHOTO
    console.log('CanvasCTRL');
    var transFactor = 10;
    var canvas = document.getElementById('canvas');
    canvas.width = 2600;
    canvas.height = 2600;
    canvas.style.height = "300px";
    canvas.style.width = $window.innerWidth + "px"
    var context = canvas.getContext("2d");
    var canvasW = canvas.width;
    var canvasH = canvas.height;
    var previousPos = {
        x: 180
        , y: 160
    }
    var startX = 180;
    var startY = 160;
    var imageX = 0;
    var imageY = 0;
    var img = new Image();
    var dragImg = new Image();
    img.onload = function () {
        context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
    }
    img.src = "img/HD-keyhole.png";
    $scope.moveImage = function (event) {
        $scope.previous = previousPos;
        var pos = getPos(canvas, event);
        $scope.position = pos;
        if (previousPos.x < pos.x) {
            imageX = imageX + (pos.x - previousPos.x);
            $scope.difference = (pos.x - previousPos.x);
        }
        else {
            imageX = imageX - (previousPos.x - pos.x);
            $scope.difference = (previousPos.x - pos.x);
        }
        $scope.result = (imageX);
        previousPos = pos;
        //        imageX += ((pos.x) - startX);
        //        imageY += ((pos.y) - startY);
        //        startX = imageX;
        //        startY=imageY;
        $scope.X = imageX;
        $scope.Y = imageY;
    }
    $scope.moveUp = function (event) {
        imageY -= transFactor;
        reDraw()
        $scope.position = event;
    }
    $scope.moveDown = function () {
        imageY += transFactor;
        reDraw()
    }
    $scope.moveRight = function () {
        imageX += transFactor;
        reDraw()
    }
    $scope.moveLeft = function () {
        imageX -= transFactor;
        reDraw()
    }

    function reDraw() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(dragImg, imageX, imageY);
        context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
    }
    $scope.savePicture = function () {
        console.log("Saving");
        var save = canvas.toDataURL();
        CameraRoll.saveToCameraRoll(save, function () {
            console.log("Saved");
        }, function (err) {
            console.log("error" + err);
        })
    }
    $scope.setStart = function (event) {
        var pos = getPos(canvas, event);
        startX = pos.x;
        startY = pos.y;
    }
    $scope.takePicture = function () {
        document.addEventListener("deviceready", function () {
            var options = {
                quality: 100
                , destinationType: Camera.DestinationType.DATA_URL
                , sourceType: Camera.PictureSourceType.CAMERA
                , allowEdit: false
                , encodingType: Camera.EncodingType.PNG
                , popoverOptions: CameraPopoverOptions
                , saveToPhotoAlbum: false
                , correctOrientation: true
            };
            $cordovaCamera.getPicture(options).then(function (imageData) {
                dragImg.src = "data:image/jpeg;base64," + imageData;
            }, function (err) {
                // error
            });
            dragImg.onload = function () {
                imageX = 0;
                imageY = 0;
                context.drawImage(dragImg, imageX, imageY);
                context.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
            }
        }, false);
    }

    function getPos(canvas, event) {
        var rect = canvas.getBoundingClientRect();
        return {
            x: (event.gesture.center.pageX - rect.left)
            , y: (event.gesture.center.pageY - rect.top)
        }
    }
    //Drive
    $scope.upload = function () {
        Drive.saveFile("photo.jpg", canvas.toDataURL()).then(function (result) {
            console.log("FileSaved: successfully.");
            $state.go('directory');
        }, function (err) {
            console.log("FileSaved: error.");
        });
    };
});
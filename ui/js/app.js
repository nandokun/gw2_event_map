
// !function(ng) {

var MAP_TILES_URL = "https://tiles.guildwars2.com/1/1/{z}/{x}/{y}.jpg",
    MAP_FLOOR_URL = "https://api.guildwars2.com/v1/map_floor.json?continent_id=1&floor=1",
    EVENTS_URL = "https://api.guildwars2.com/v1/events.json?world_id={world}&map_id={map}",
    EVENT_DETAILS_URL = "https://api.guildwars2.com/v1/event_details.json?event_id={event_id}",
    FILES_URL = "https://api.guildwars2.com/v1/files.json",
    IMAGES_URL = "https://render.guildwars2.com/file/{signature}/{file_id}.png";

// Module definition
var app = angular.module('gw2', ['leaflet-directive']); //, 'filters']);

/*
angular.module('filters', [])
    .filter('groupBy', [function () {
        return function (collection, property) {

            if (collection.length === 0)
                return null;

            var result = {},
                i = collection.length - 1;

            while (i > -1) {
                if (!(collection[i][property] in result))
                    result[collection[i][property]] = [];

                result[collection[i][property]].push(collection[i]);
                i -= 1;
            }

            return result;
        };
    }]);
*/

var errorCallBack = function (arg1, arg2, arg3) {
    alert(arg1);
};


function MapManager(options, tiles) {
    // Setup map
    map = L.map("map", {
        minZoom: options.defaults.minZoom,
        maxZoom: options.defaults.maxZoom,
        center: L.latLng(options.center.lat, options.center.lng),
        layers: [L.tileLayer(MAP_TILES_URL,
            {
                minZoom: options.defaults.minZoom,
                maxZoom: options.defaults.maxZoom,
                maxNativeZoom: options.defaults.maxZoom + 2,
                continuousWorld: true
            }]
})]
        //crs: L.CRS.Simple
    });
}


///////////////
// Controllers
///////////////

app.controller('MapCtrl', ['$scope', 'leafletData', 'leafletBoundsHelpers',
function ($scope, leafletData, leafletBoundsHelpers) {

    var map = new MapManager({
        defaults: {
            minZoom: 3,
            maxZoom: 8,
            zoom: 0
        },
        center: {
            lat: 0,
            lng: 0
        },
        tiles: {
            url: MAP_TILES_URL
        }
    });

    var player;
    var playerMarker;
    var MAX_ZOOM;

    function unproject (coord) {
        return map.unproject([coord.x, coord.y], MAX_ZOOM);
    }

    function updatePlayerMarker (pos, dir) {
        if ('player' in $scope.markers) {
            $scope.markers.player.lat = pos.lat;
            $scope.markers.player.lng = pos.lng;
        } else {
            $scope.markers = {
                player: {
                    lat: pos.lat, lng: pos.lng,
                    draggable: false,
                    icon: {
                        type: 'div',
                        iconSize: [48, 48],
                        iconAnchor: [24, 24],
                        className: 'markerPlayer',
                        html: '<img src="media/position.png">'
                    }
                }
            };
        }

        //var scale = 1 - 0.05 * (7 - map.getZoom());
        var scale = (map.getZoom() + 13) / 20;
        
        if (!playerMarker) {
            leafletData.getMarkers().then(function (marker) {
                if ('player' in marker)
                    playerMarker = marker.player._icon;
            });
        } else {
            $('.playerMarker').css({
                transform: 'scale(' + scale + ',' + scale + ') rotate(' + dir + 'deg)'
            });
        }

        // console.log(player.direction)
        // $('.playerMarker img').css({
        //     transform: 'scale(' + scale + ',' + scale + ') rotate(' + json.direction + 'deg)'
        // });
    }

    function updateCamera (pos, zoom) {
        $scope.center.lat = pos.lat;
        $scope.center.lng = pos.lng;

        if (zoom !== 'undefined')
            $scope.center.zoom = zoom;
    }

    $scope.initialize = function () {
        var ws;
        var host = "localhost";
        var port = "8080";
        var uri = "/ws";
        var pos, oldPos;

        ws = new WebSocket("ws://" + host + ":" + port + uri);

        // // Store map to closure scoped var
        // leafletData.getMap().then(function(m) {
        //     map = m;
        //     MAX_ZOOM = map.getMaxZoom();
        // });

        ws.onmessage = function (evt) {
            var json = angular.fromJson(evt.data); //$.parseJSON
            var setCamera = false;

            if (json.updated) {

                // On first run or new map
                if (!player || player.map.id !== json.map.id) {
                    player = json;
                    setCamera = true;
                    // map.setView(pos, map.getZoom());
                    // loadMapPoints();
                    // loadEvents(event_filter);
                    // supermarker.setZIndexOffset(1000)
                }

                if (json.moving) {
                    pos = unproject(json.position);
                    updatePlayerMarker(pos, player.direction);
                }

                if (setCamera)
                    updateCamera(pos, MAX_ZOOM);

                $scope.$apply();

                //     if (!map.getBounds().pad(-0.2).contains(pos))
                //         map.setView(pos, map.getZoom());

                //     if ("_icon" in supermarker)
                //         supermarker._icon.title = player.name;

                //     supermarker.update();
                //     oldPos = pos;
                //     scale = 1 - 0.05 * (7 - map.getZoom());

                //     console.log(player.direction)
                //     $('.fancyPlayerPos img').css({
                //         transform: 'scale(' + scale + ',' + scale + ') rotate(' + json.direction + 'deg)'
                //     });
                // }
            }
        };

        ws.onclose = function (evt) {
            console.log("Connection close");
        };

        ws.onopen = function (evt) {
            console.log("Connection open");
        };
    };

    // if (!map) {
    //     initializeMap();
    // }

    // function initializeMap() {
    //     leafletData.setMap()
    //     .then(function(m) {
    //         map = m;

    //         var southWest = unproject([0, 32768]),
    //             northEast = unproject([32768, 0]);
    //         map.setView(pos, map.getZoom() | 7);
    //     })
    //     .catch(function(e) {
    //         debugger;
    //     })
    //     .finally(function(e) {
    //         debugger;
    //     });
    // }

    // function unproject(coord) {
    //     return map.unproject(coord, map.getMaxZoom());
    // }
}]);
/*
function PageCtrl ($scope, $http) {

    //********************
    //  Scope Variables
    //********************
    $scope.debug = true;

    $scope.token = null;
    $scope.user = null;
    $scope.project = '';
    $scope.action = '';
    $scope.displayedStandup = '';


    //********************
    //  Page Functions
    //********************

    $scope.initialize = function () {
    };


    //********************
    //  Helpers
    //********************

    $scope.login = function (un, pass) {
        if ($scope.debug) {
            $scope.token = 'ec34cefb2644464fad69674eee9bd186';
            $scope.user = 'Nando';
            $scope.getProjects();
            return
        }
        var cb = function (data, status, headers, config) {
            // Cache token and username
            $scope.token = data.id;
            $scope.user = data.user;

            // Set X-Auth-Token for future calls
            $http.defaults.headers.common['X-Auth-Token'] = data.id;

            $scope.getProjects();
        };

        // Make call to authentication resource
        $http
            .post(api_url + 'auth', {username: un, password: pass})
            .success(cb)
            .error(errorCallBack);
    };

    $scope.getProjects = function () {
        if ($scope.debug) {
            $scope.project = $scope.projects['Project 1'];
            $scope.user = $scope.project.members['Nando'];
            return
        }

        var cb = function (data, status, headers, config) {
            $scope.projects = {};

            data.forEach(function (item) {
                $scope.projects[item.name] = item;
            });

            $scope.project = data[0].name;
        };

        $http
            .get(api_url + 'projects')
            .success(cb)
            .error(errorCallBack);  
    };

    $scope.switchProject = function (project) {
        $scope.project = project;
    };

    $scope.getActivities = function () {
        var cb = function (data, status, headers, config) {
            debugger;
        };

        $http
            .get(api_url + 'tasks')
            .success(cb)
            .error(errorCallBack);  
    }

    $scope.getClassColor = function (key) {
        return 'color' + (key % 5 + 1).toString();
    };

    $scope.setStandup = function (user) {
        $scope.displayedStandup = user;
    };

    $scope.addTask = function (evt, task, user) {
        if (evt.keyCode===13)
            user.tasks.push({
                active: false,
                blocker: false,
                done: false,
                name: task,
                taskId: "100",
                today: false
            });
    };


    $scope.doAction = function (type, param) {

        // var getFlavorFromId = function (id) {
        //     return $scope.$parent.flavors.filter(
        //         function (elem) { return (elem.id === id); })[0];
        // };

        $scope.action = type;

        switch (type) {
        case 'task':
            break;
        case 'standup':
            $scope.displayedStandup = param;
            break;
        }
    };

    $scope.submitAction = function (type, data, another) {

        var reloadOnFinish = function(another) {
            $scope.resetActions();

            if (!another)
                $scope.$parent.action = '';

            location.reload();
        };

        var payload;
    };

    $scope.cancelAction = function () {
        $scope.action = '';
        $scope.resetActions();
    };

    $scope.resetActions = function (type) {
        var clearAll = (type === undefined);

    };
}
*/
// }(window.angular);
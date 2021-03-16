var attendanceApp = angular.module("userJoinListApp",[]);
attendanceApp.controller("userJoinListController",function($scope) {
    $scope.updateAttendanceLayout = function(data){
        $scope.attendanceTemplate = {url: '../assets/room_template/template_attendance.html'};
        $scope.attendee = data;
    }
    $scope.updateAttendanceLayout([]);
});
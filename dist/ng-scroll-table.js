/*
  ngScrollTable v0.0.3
  (c) 2016 Gildson
*/
angular.module('ng-scroll-table', [])
    .run(['$templateCache', function($templateCache){
      $templateCache.put('template/ng-scroll-table.html',
        '<div>' +
        ' <table class="s-table">' +
        '   <tr>' +
        '     <td class="s-table-title">' +
        '       <div style="width: {{parentWidth-(18*(!inMobile()))}}px;">' +
        '         <table style="width: {{totalColumnsWidth}}px;">' +
        '           <tr>' +
        '             <td colspan="100%">' +
        '               <table class="table table-condensed table-bordered">' +
        '                 <tr>' +
        '                   <th style="max-width: {{ col.width }}px; width: {{ col.width }}px" ng-repeat="col in columns" ng-if="!col.invisible">' +
        '                     <div ng-click="setOrder(col.field)" ng-class="{\'text-left\': col.alignDescription == 1, \'text-center\': col.alignDescription == 2, \'text-right\': col.alignDescription == 3}">' +
        '                       {{ col.description || col.field }}' +
        '                       <span class="pull-right" ng-if="col.field == orderField && !orderAscendant">+</span>' +
        '                       <span class="pull-right" ng-if="col.field == orderField && orderAscendant">-</span>' +
        '                     </div>' +
        '                     <span ng-mousedown="mouseDown($event, col)" ng-mouseup="mouseUp(event, col)"></span>' +
        '                   </th>' +
        '                 </tr>' +
        '               </table>' +
        '             </td>' +
        '           </tr>' +
        '         </table>' +
        '       </div>' +
        '     </td>' +
        '   </tr>' +
        '   <tr>' +
        '     <td>' +
        '       <div class="s-table-content" style="width: {{parentWidth}}px; height: {{contentHeight-(62*(usePagination&&_rows.length > 0))}}px; ">' +
        '         <hr size="1" style="width: {{totalColumnsWidth}}px; margin: -1px;">' +
        '         <table style="width: {{totalColumnsWidth}}px" class="table table-condensed table-hover table-bordered table-striped">' +
        '           <tr ng-repeat="row in pageRows track by $index" ng-click="_click(row)" ng-dblclick="_dblclick(row)" style="width: {{totalColumnsWidth}}px; display: block;" ng-class="{\'s-table-selected\': row.properties.selected}">' +
        '             <td style="max-width: {{col.width}}px; width: {{col.width}}px" ng-repeat="col in columns" ng-if="!col.invisible" ng-class="{\'text-left\': col.alignContent == 1, \'text-center\': col.alignContent == 2, \'text-right\': col.alignContent == 3}">' +
        '               {{ row.data[col.field] }}' +
        '             </td>' +
        '           </tr>' +
        '         </table>' +
        '       </div>' +
        '     </td>' +
        '   </tr>' +
        '   <tr class="s-pagination" ng-if="usePagination && _rows.length > 0">' +
        '     <td colspan="100%">' +
        '       <ul style="float:left;">' +
        '         <li>' +
        '           De {{ (currentPage - 1) * pagination.rowsByPage + 1 }} à {{ (currentPage - 1) * pagination.rowsByPage + pageRows.length }} de {{ _rows.length }} Registros' +
        '         </li>' +
        '       </ul>' +
        '       <ul>' +
        '         <li>' +
        '           Registros por página' +
        '         </li>' +
        '         <li>' +
        '           <select ng-model="pagination.rowsByPage" ng-options="rowOption for rowOption in pagination.rowsOptions" ng-change="updateRowsByPage()"></select>' +
        '         </li>' +
        '         <li>' +
        '           <div class="input-group xs-mb-15">' +
        '             <div class="input-group-btn">' +
        '               <button type="button" class="btn btn-default" ng-disabled="currentPage==1" ng-click="setPrevPage()">Anterior</button>' +
        '               <button type="button" class="btn btn-default" ng-show="currentPage > 3 && quantPages > 5" ng-click="setCurrentPage(1)">1</button>' +
        '               <button type="button" class="btn btn-default" ng-show="currentPage > 3 && quantPages > 5">...</button>' +
        '               <button ng-repeat="p in pages" ng-click="setCurrentPage(p)" type="button" class="btn btn-default" ng-class="{\'active\': currentPage == p}">{{p}}</button>' +
        '               <button type="button" class="btn btn-default" ng-show="currentPage < quantPages - 2 && quantPages > 5">...</button>' +
        '               <button type="button" class="btn btn-default" ng-show="currentPage < quantPages - 2 && quantPages > 5" ng-click="setCurrentPage(quantPages)">{{quantPages}}</button>' +
        '               <button type="button" class="btn btn-default" ng-disabled="quantPages==currentPage" ng-click="setNextPage()">Próxima</button>' +
        '             </div>' +
        '           </div>' +
        '         </li>' +
        '       </ul>' +
        '     </td>' +
        '   </tr>' +
        ' </table>' +
        '</div>');
    }])
    .directive('ngScrollTable', ['$document', '$timeout', '$window', function($document, $timeout, $window){
      return {
        restrict: 'A',
        replace: true,
        templateUrl: function(element, attrs){
          return attrs.templateUrl || 'template/ng-scroll-table.html';
        },
        scope: {
          columns:          '=stColumns', 
          rows:             '=?stRows', 
          click:            '=?stClick', 
          dblclick:         '=?stDblclick', 
          usePagination:    '=?stUsePagination', 
          rowSelected:      '=?stRowSelected', 
          rowsOptions:      '=?stRowsOptions', 
          rowsByPage:       '=?stRowsByPage', 
          orderField:       '=?stOrderField',
          orderAscendant:   '=?stOrderAscendant',
          extraColumnsWidth:'=?stExtraColumnsWidth',
          extra:            '=?stExtra' 
        },
        link: function(scope, element, attrs){

          scope.rows = (scope.rows ? scope.rows : []);
          scope._rows = [];
          scope.usePagination = (scope.usePagination == undefined ? false : scope.usePagination);
          scope.rowSelected = (scope.rowSelected ? scope.rowSelected : {});
          scope.pagination = {};
          scope.pagination.rowsOptions = (scope.rowsOptions ? scope.rowsOptions : [10, 20, 30, 40, 50]);
          scope.pagination.rowsByPage = (scope.rowsByPage ? scope.rowsByPage : scope.pagination.rowsOptions[0]);
          scope.orderField = (scope.orderField ? scope.orderField : '');
          scope.orderAscendant = (scope.orderAscendant == undefined ? false : scope.orderAscendant);
          scope.extraColumnsWidth = (scope.extraColumnsWidth ? scope.extraColumnsWidth : 0);
          scope.pageRows = [];
          scope.currentPage = 1;
          scope.quantPages = 1;
          scope.totalColumnsWidth = 0;
          scope.parentWidth = 0;
          scope.contentHeight = 0;
          scope.resizer = {
              clicked: false, 
              lastX: 0, 
              oldX: 0,
              column: null,
              minWidth: 100 };

          /****************
           * internal
           ****************/
          scope._click = function(row){
            scope.deselectAll();
            row.properties.selected = true;
            scope.rowSelected = row;

            if(scope.click){
              scope.click(row);
            }
          };

          scope._dblclick = function(row){
            if(scope.dblclick){
              scope.dblclick(row);
            }
          };

          scope.adjustRows = function(){
            scope.currentPage = 1;

            // create table properties
            for(var n = 0; n < scope._rows.length; n++){
              scope._rows[n].properties = {selected: false};
            }
          };

          scope.deselectAll = function(){
            for(var n = 0; n < scope._rows.length; n++){
              scope._rows[n].properties.selected = false;
            }
          };

          scope.sortRows = function(){
            function compare(a,b) {
              var a_c = (isNaN(a.data[scope.orderField]) ? a.data[scope.orderField].toLowerCase() : a.data[scope.orderField]);
              var b_c = (isNaN(b.data[scope.orderField]) ? b.data[scope.orderField].toLowerCase() : b.data[scope.orderField]);
              if (a_c < b_c)
                return (scope.orderAscendant ? -1 : 1);
              else if (a_c > b_c)
                return (scope.orderAscendant ? 1 : -1);
              else
                return 0;
            }

            scope._rows.sort(compare);

            scope.updatePages();
          };

          scope.updateTotalColumnsWidth = function(){
            scope.totalColumnsWidth = scope.extraColumnsWidth;
            for(var n = 0; n < scope.columns.length; n++){
              if(!scope.columns[n].invisible){
                scope.totalColumnsWidth += scope.columns[n].width;
              }
            }
          };

          /****************
           * ordation
           ****************/
          scope.setOrder = function(orderField){
            scope.orderAscendant = (scope.orderField == orderField ? !scope.orderAscendant : true);
            scope.orderField = orderField;
            scope.sortRows();
          };

          /****************
           * resizer
           ****************/
          scope.mouseDown = function(event, column){
            scope.resizer.column = column;
            scope.resizer.clicked = true;
            scope.resizer.lastX = event.clientX;
            scope.resizer.oldX = column.width;
            event.preventDefault();
          };

          $document.bind('mouseup', function(event){
            scope.resizer.clicked = false;
          });

          $document.bind('mousemove', function(event){
            if(scope.resizer.clicked){
              // para nao quebrar o tamanho original da table
              var newWidth = scope.resizer.oldX + event.clientX - scope.resizer.lastX;
              if(newWidth >= scope.resizer.minWidth || (scope.resizer.column.width < scope.resizer.minWidth && newWidth > scope.resizer.column.width)){
                scope.resizer.column.width = newWidth;
                scope.updateTotalColumnsWidth();
                scope.$apply();
              }
            }
          });

          /****************
           * pagination
           ****************/
          scope.setCurrentPage = function(currentPage){
            scope.currentPage = currentPage;
            scope.updatePages();
          };

          scope.setPrevPage = function(){
            if(scope.currentPage > 1){
              scope.setCurrentPage(scope.currentPage - 1);
            }
          };

          scope.setNextPage = function(){
            if(scope.currentPage < scope.quantPages){
              scope.setCurrentPage(scope.currentPage + 1);
            }
          };

          scope.updateRows = function(){

            scope._rows = [];

            for(var n = 0; n < scope.rows.length; n++){
              scope._rows.push({data: scope.rows[n]});
            }

            scope.updatePages();
          };

          scope.updatePages = function(){

            if(scope.usePagination){
              // com paginacao
              if(scope._rows.length > 0){

                scope.pageRows = [];

                scope.quantPages = Math.ceil(scope._rows.length / scope.pagination.rowsByPage);

                var initialRegister = (scope.currentPage - 1) * scope.pagination.rowsByPage;
                var lastRegisterOfPage = scope.currentPage * scope.pagination.rowsByPage - 1;
                var lastRegister = scope._rows.length - 1;

                for(var n = initialRegister; n <= lastRegisterOfPage && n <= lastRegister; n++){
                  scope.pageRows.push(scope._rows[n]);
                }

                scope.pages = [];

                var pageInitial = 1;
                if (scope.currentPage > 3 && scope.quantPages > 5 && scope.quantPages - 2 > scope.currentPage){
                  pageInitial = scope.currentPage - 2;
                } else if(scope.currentPage > 3 && scope.quantPages - 2 <= scope.currentPage){
                  pageInitial = scope.currentPage - (4 - (scope.quantPages - scope.currentPage));
                }

                for(var n = 0; n < 5 && n < scope.quantPages; n++){
                  scope.pages.push(pageInitial + n);
                }

              }else{
                scope.pages = [1];
                scope.pageRows = [];
              }
            }else{
              // sem paginacao
              scope.pageRows = scope._rows;
            }
          };

          scope.updateRowsByPage = function(){
            scope.currentPage = 1;
            scope.updatePages();
          };

          /****************
           * auxiliaries
           ****************/
          scope.inMobile = function(){
            return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
          };

          /****************
           * watchs
           ****************/
          scope.$watch(function(){
            return {
              'h': $window.innerHeight,
              'w': $window.innerWidth}
            },
            function(){
              scope.updateTotalColumnsWidth();
              scope.parentWidth = element[0].parentElement.clientWidth;
              scope.contentHeight = element[0].parentElement.clientHeight - angular.element(element[0].querySelector('.s-table-title > div'))[0].clientHeight;
            }, true);

          scope.$watch('rows', function(){
            
            // if(scope.orderField){
            //   scope.sortRows();
            // }
            
            scope.updateRows();

            scope.adjustRows();

          }, true);

          scope.$watch('pagination', function(){
            scope.rowsByPage = scope.pagination.rowsByPage;
            scope.rowsOptions = scope.pagination.rowsOptions;
          }, true);

          scope.$watch('usePagination', function(){
            scope.updatePages();
          });

          /****************
           * timeouts
           ****************/
          $timeout(function() {
            scope.contentHeight = element[0].parentElement.clientHeight - angular.element(element[0].querySelector('.s-table-title > div'))[0].clientHeight;
            // scope.adjustRows();
          });

          /****************
           * binds
           ****************/
          var tableContentElement = element[0].querySelector('.s-table-content');
          angular.element(tableContentElement).bind('scroll', function(a){
            var tableEditElement = element[0].querySelector('.s-table-edit');
            angular.element(element[0].querySelector('.s-table-title > div'))[0].scrollLeft = angular.element(tableContentElement)[0].scrollLeft;
            if(tableEditElement){
              angular.element(tableEditElement)[0].scrollTop = angular.element(tableContentElement)[0].scrollTop;
            }
          });
          angular.element(element[0].querySelector('.s-table-title > div')).bind('scroll', function(a){
            angular.element(element[0].querySelector('.s-table-content'))[0].scrollLeft = angular.element(element[0].querySelector('.s-table-title > div'))[0].scrollLeft;
          });

          angular.element($window).bind('resize', function(e){
            scope.$apply();
          });
        }
      }
    }]);
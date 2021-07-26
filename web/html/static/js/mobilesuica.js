let get_data = function(files,uuid){
  var fileList = []
  var formData = new FormData
  for(var i=0;i<files.length;i++){
    fileList.push(files[i].name)
    formData.append(i,files[i].name)
  }
  formData.append('uuid',uuid)
  dispLoading(fileList)
  $.ajax({type:'post',url:'/api/v1/data/',data:formData,contentType:false,processData:false,
      success:function(j){
        removeLoading()
        full_data = $.extend(true,[],j.data)
        original = $.extend(true,[],j.data)
        headerList = {'ms_month':'月','ms_day':'日','ms_type1':'種別','ms_boarding_station':'利用駅','ms_type2':'種別','ms_gettingoff_station':'利用駅','ms_balance':'残額','ms_diff':'差額'}
        headerListOriginal = JSON.parse(JSON.stringify(headerList))
        unique_data = $.extend(true,[],j.unique)
        global_flag = {'init':'first'}
        htmlInitialize()
        Initialize_datatables()
      },
      error:function(xhr,status,e){
        if('responseJSON' in xhr){
          alert(xhr['responseJSON']['error'])
        }else{
          alert('error',status)
        }
        removeLoading()
      }
    })
}

let Initialize_datatables = function(){

  

    pdfMake.fonts = {
      GenShin: {
        normal: 'GenShinGothic-Normal-Sub.ttf',
        bold: 'GenShinGothic-Normal-Sub.ttf',
        italics: 'GenShinGothic-Normal-Sub.ttf',
        bolditalics: 'GenShinGothic-Normal-Sub.ttf'
      }
    }

    // Initialize DataTables
    
    table = $('#ms_usage_table')
    .on( 'init.dt', function () {
      // change button design
      // https://stackoverflow.com/questions/37473796/customizing-the-appearance-of-datatable-button
      var btns = $('.dt-button');
      btns.addClass('btn btn-outline-primary');
      btns.removeClass('dt-button')

      $('#top_wrapper').hide()
      $('#ms_usage_wrapper').show()
    })
    .DataTable({
      language: {
      url: "https://cdn.datatables.net/plug-ins/9dcbecd42ad/i18n/Japanese.json"
      },
     data:full_data,
     
     lengthMenu: [[10,25,50,100,-1],[10,25,50,100,"全"]],
     pageLength: -1,
     dom: 'lBfrtip',
     buttons: [
      {
          extend: 'excelHtml5',
          text: 'EXCELファイルに出力',
          footer: true,
          filename: 'mobilesuica.xlsx',
          exportOptions: {
            // Export all visible columns except checkbox
            //https://stackoverflow.com/questions/36953426/exclude-column-from-export-in-datatables-buttons
            columns: ':visible:not(:eq(0))' 
          }
      },
      {
          extend: 'csvHtml5',
          text: 'CSVファイルに出力',
          bom:true,
          footer: true,
          filename: 'mobilesuica.csv',
          exportOptions: {
            columns: ':visible:not(:eq(0))' 
          }
      },
      {
          extend: 'pdfHtml5',
          text: 'PDFファイルに出力',
          footer: true,
          filename: 'mobilesuica.pdf',
          customize: function ( doc ) {
            doc.defaultStyle.font= 'GenShin';
          },
          exportOptions: {
            columns: ':visible:not(:eq(0))' 
            }
      },
      {
          extend: 'copyHtml5',
          text: 'クリップボードにコピー',
          footer: true,
          filename: 'mobilesuica.html',
          exportOptions: {
            columns: ':visible:not(:eq(0))' 
          }
      },
      {
          extend: 'print',
          text: '印刷',
          footer: true,
          exportOptions: {
            columns: ':visible:not(:eq(0))' 
          },
      }
    ],
     'columnDefs': [
      {
      'targets': 0,
      'width': '10px',
      'searchable': false,
      'orderable': false,
      'className': 'ms_checkbox',
      'render': function (data){
          return '<input type="checkbox" name="o_chk" value="' + data + '">'
      }
      },
      {
        'targets': 1,
        'className': 'ms_month',
      },
      {
        'targets': 2,
        'className': 'ms_day',
      },
      {
        'targets': 3,
        'className': 'ms_type1',
      },
      {
        'targets': 4,
        'className': 'ms_boarding_station',
      },
      {
        'targets': 5,
        'className': 'ms_type2',
      },
      {
        'targets': 6,
        'className': 'ms_gettingoff_station',
      },
      {
        'targets': 7,
        'className': 'ms_balance',
        'render': function(data){
          return data.replace(/\\/,'\xA5')
        }
      },
      {
        'targets': 8,
        'className': 'ms_diff',
      },
      ],
     'order': [[1, 'asc'],[2, 'asc']],
     'initComplete':function(){
       if(global_flag['init'] == 'batch'){
        
        var selected_option = ['VIEW','現金','物販','繰']
        reverse()
        var d = ['ms_type1','ms_type2','ms_balance']
        d.forEach((c_name) => {
          table.column('.'+c_name).visible(false)
        })
        
        $('#hide_column').selectpicker('val',d)
        $('#delete_row_bulk').selectpicker('val',selected_option)
        delete_row_bulk()
        delete_row()
        show_sum()
        
        if($('#add_yen').prop('disabled') == false){
          add_yen()
        }
        $('#add_yen').prop('disabled',true)
        
        global_flag['init'] = 'first'
       }
     }
   })
   
 }

let back_to_default_button = function(){
  full_data = $.extend(true,[],original)
  headerList = JSON.parse(JSON.stringify(headerListOriginal))
  changeHeader()
  $('#deletedRowWrapper').hide()
  $('#deletedColumnWrapper').hide()
  $('#add_yen').prop('disabled',false)
  // deSelectAll doesn't work
  // https://stackoverflow.com/questions/28349539/deselectall-doesnt-work-for-bootstrap-select
  $('#delete_row_bulk').selectpicker('val','')
  $('#hide_column').selectpicker('val','')
  $('#numRemove').html('')
  $('#all_checks').prop('checked', false)
  table.destroy()
  //location.reload(false)
  $('#footer').html('<th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th><th></th>')
  global_flag = {'init':'first'}
  htmlInitialize()
  Initialize_datatables()
  
}

let delete_row = function(){  
  table.rows('.selected').remove().draw()
  $('#all_checks').prop('checked',false)
  $('#deleteRowBulkConfirmModal').modal('hide')
  showDeletedAndHiddenType()
}

let showDeletedAndHiddenType = function(){
  // For deleted Row
  var currentTypeList = table.columns('.ms_type1').data()[0]
  currentTypeList = $.merge(currentTypeList,table.columns('.ms_type2').data()[0])
  // Remove duplication from list
  // https://qiita.com/cocottejs/items/7afe6d5f27ee7c36c61f
  currentTypeList = currentTypeList.filter((x, i, self) => self.indexOf(x) === i)
  var deletedType = []
  unique_data.forEach((item) => {
    if($.inArray(item,currentTypeList) == -1){
      deletedType.push(item)
    }
  })
  $('#delete_row_bulk').selectpicker('val',deletedType)
  if(deletedType.length > 0){
    var txt = ''
    deletedType.forEach((item) => {
      txt += '<button class="btn btn-info" disabled>' + item + '</button>\n'
    })
    txt = txt.slice(0,-1)
    $('#deletedRowType').html(txt)
    $('#deletedRowWrapper').show()
  }

  // For hidden column
  var deletedColumn = $('#hide_column').selectpicker('val')
  txt = ''
  if(deletedColumn.length > 0){
    deletedColumn.forEach((item) => {
      txt += '<button class="btn btn-info" disabled>' + headerList[item] + '</button>\n'
    })
    txt = txt.slice(0,-1)
    $('#deletedColumnType').html(txt)
    $('#deletedColumnWrapper').show()
  }else{
    $('#deletedColumnWrapper').hide()
  }
}

let delete_row_bulkWrapper = function(){
  delete_row_bulk('selected')
}

let delete_row_bulkClose = function(){
  var count = table.rows('.selected').count()
  if(count != 0){
    $('#numRemove').html(count)
    $('#deleteRowBulkConfirmModal').modal('show')
  }
  showDeletedAndHiddenType()
}

let delete_row_bulk = function(flagFromWrapper){
  // Change color of selected items
  var selected_option = $('#delete_row_bulk').val()
  var num = 0
    table.rows().every(function(index) {
    var d = [this.data()[3],this.data()[5]]
    if(getIsDuplicate(d,selected_option)){
      this.nodes().to$().addClass('selected')
      $('#ms_usage_list>tr').eq(index).find('input').prop('checked',true)
      num += 1
    }else{
      this.nodes().to$().removeClass('selected')
      $('#ms_usage_list>tr').eq(index).find('input').prop('checked',false)
    }
  })
}

let closeRemoveRowModal = function(){
  $('#numRemove').html('')
}

let hide_column = function(){
  table.columns().visible(true)
  $('#hide_column').val().forEach((v) => {
    table.column('.'+v).visible(false)
  })
  
  if($('#footer').text()){
    show_sum()
  }
  showDeletedAndHiddenType()
}

let DnD = function(e){
if(e.type == 'dragstart'){
  e.originalEvent.dataTransfer.setData('text', this.id)
}else if(e.type == 'dragover'){
  e.stopPropagation();  
  e.preventDefault();  
  $(this).css('border', '4px solid #000')
}else if(e.type == 'dragenter'){
  e.stopPropagation();  
  e.preventDefault();  
  $(this).css('border', '4px solid #000')
}else if(e.type == 'drop'){
  $(this).css('border', '4px dashed #000');  
  e.preventDefault();
  //console.log(JSON.stringify(e.originalEvent.dataTransfer.files))
  var files = e.originalEvent.dataTransfer.files
  upload_files(files,0)
}
}

let DnDdocument = function(e){
if(e.type == 'dragstart'){
  e.originalEvent.dataTransfer.setData('text', this.id)
}else if(e.type == 'dragover'){
  e.stopPropagation();  
  e.preventDefault();  
  $('#DnDBox').css('border', '4px dashed #000'); 
}else if(e.type == 'dragenter'){
  e.stopPropagation();  
  e.preventDefault();  
}
}

let upload_files_wrapper = function(){
upload_files(this.files)
}

let upload_files = function(f){
var files = $.extend(true,{},f)
$('#upload_file').val('')
//console.log(files)
if(files.length == 0){
  alert('Please select at least 1 file')
}

var uuid = generateUuid()
upload_files_continue(files,uuid,0)
}

let upload_files_continue = function(files,uuid,i){
//console.log(files,uuid,i)

if(i == files.length){
  get_data(files,uuid)
}else{
  var reader = new FileReader
  var formData = new FormData
  var file_name = files[i].name

  reader.onload = function(){
    formData.append(file_name,files[i])
    formData.append('uuid',uuid)
    formData.append('file_name',file_name)

    $.ajax({type:'post',url:'/api/v1/upload/',data:formData,contentType:false,processData:false,
      success:function(){
        i++
        upload_files_continue(files,uuid,i)
      },
      error:function(e){
        alert('もう一度リロードして試してください')
      }
    })
  }
  reader.readAsArrayBuffer(files[i])
}
}

let reverse = function(){
const formatter = new Intl.NumberFormat('ja-JP')
var patternYen = /(\xA5)/
var patternSign = /^([-,\+])/
full_data.forEach((element,index) => {
  var d2 = ''
  var str = String(element[element.length-1])
  // ￥がついているかどうか
  if(str.match(patternYen)){
    //　￥がついていたら外す
    strReplaced = str.replace(patternYen,'')
    // ￥を外したものの符号を逆転
    strReplacedReverse = reverseSign(strReplaced)
    //符号を逆転して+が無くっている場合への対応
    if(strReplacedReverse.match(patternSign)){
      d2 = strReplacedReverse.replace(patternSign,'$1'+'\xA5')
    }else{
      d2 = '\xA5' + strReplacedReverse
    }
  }else{
    d2 = reverseSign(str)
  }
  full_data[index][8] = d2
})
table.rows().invalidate()

function reverseSign(str){
  // https://www.sejuku.net/blog/23998
  var d = Number(str.replace(/,/,''))
  d = d*(-1)
  // thousand separator
  // https://qiita.com/shisama/items/661c33fef5cbe3bb8335
  var d1 = ''
  if(d > 0 || d < 0){
    d1 = formatter.format(d)
  }
  return d1
}
}

let add_yen = function(){
  var pattern = /^([-,\+])/
  full_data.forEach((element,index) => {
    var d = String(element[element.length-1])
    var d1 = ''
    if(d.match(pattern)){
      var d1 = d.replace(pattern,'$1'+'\xA5')
    }else{
      if(d){
        d1 = '\xA5' + d
      }
    }
    full_data[index][8] = d1
  })
  table.rows().invalidate()
  $('#add_yen').prop('disabled',true)
}

let show_sum = function(){
  // Check Diff is visible
  if(!table.column('.ms_diff').visible()){
    alert(headerList['ms_diff'] + 'を表示してください')
  }else{

    // Remove the formatting to get integer data for summation
    var intVal = function ( i ) {
        return typeof i === 'string' ?
            i.replace(/[\$,]/g, '')*1 :
            typeof i === 'number' ?
                i : 0;
    };

    // Total over all pages
    total = table.column('.ms_diff').data().reduce( function (a, b) {
      a = String(a).replace(/\xA5/,'')
      b = String(b).replace(/\xA5/,'')
            return intVal(a) + intVal(b);
    }, 0 );

    // Total over this page
    pageTotal = table.column( '.ms_diff', { page: 'current'} ).data().reduce( function (a, b) {
      a = String(a).replace(/\xA5/,'')
      b = String(b).replace(/\xA5/,'')
            return intVal(a) + intVal(b);
    }, 0 );

    // Update footer
    const formatter = new Intl.NumberFormat('ja-JP')
    var count = table.columns(':visible').count()
    if(count < 3){
      alert('列を3つ以上表示してください')
    }
    // Remove current value
    $(table.columns().footer()).html('')

    table.columns(':visible').every(function(index,t_loop,c_loop){
      if(c_loop == count-2){
        $(this.footer()).html('合計')
      }
    })
    $(table.column('.ms_diff').footer()).html('\xA5'+ formatter.format(pageTotal))
  }
 }

let recommend1 = function(){
  headerList['ms_diff'] = '運賃'
  changeHeader()
  table.destroy()
  $('#delete_row_bulk').selectpicker('val','')
  $('#hide_column').selectpicker('val','')
  htmlInitialize()
  global_flag['init'] = 'batch'
  Initialize_datatables()
}

let all_select = function(){
  var that = this
  // Understand how to use tables.rows().every() with JQuery selector
  // https://datatables.net/forums/discussion/44654/how-to-iterate-through-table-rows-to-get-both-data-and-node-information#Comment_118102
  table.rows(':visible').every(function() {
    $(this.node()).find('td').eq(0).find('input').prop('checked',that.checked)
    if(that.checked == true){
      $(this.nodes()).addClass('selected')
    }else{
      $(this.nodes()).removeClass('selected')
    }
  })
  /*
  if(this.checked == true){
    $('input[name=o_chk]').prop('checked',this.checked)
    table.rows().nodes().to$().addClass('selected')
  }else{
    table.rows().nodes().to$().removeClass('selected')
    $('input[name=o_chk]').prop('checked',this.checked)
  }*/
}

let ind_select = function(){
  var that = this
  var count = 0
  table.rows(':visible').every(function() {
    if($(this.node()).find('td').eq(0).find('input').prop('checked')){
      count += 1
      $(this.node()).addClass('selected')
    }else{
      $(this.node()).removeClass('selected')
    }
  })

  if(count == table.rows(':visible').count()){
    $('#all_checks').prop('checked', true)
  }else{
    $('#all_checks').prop('checked', false)
  }
  /*
  if ($('#ms_usage_list :checked').length == $('#ms_usage_list :input').length) {
      // 全てのチェックボックスにチェックが入っていたら、「全選択」 = checked  
      $('#all_checks').prop('checked', true);
  } else {
      // 1つでもチェックが入っていなかったら、「全選択」 = unchecked
      $('#all_checks').prop('checked', false);
  }
  
  $('input[name=o_chk]').each(function(){
    if($(this).prop('checked') == true){
      $(this).parent().parent().addClass('selected')
    }else{
      $(this).parent().parent().removeClass('selected')
    }
  })*/
}

let generateUuid = function(){
  // https://github.com/GoogleChrome/chrome-platform-analytics/blob/master/src/internal/identifier.js
  // const FORMAT: string = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx";
  let chars = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".split("");
  for (let i = 0, len = chars.length; i < len; i++) {
      switch (chars[i]) {
          case "x":
              chars[i] = Math.floor(Math.random() * 16).toString(16);
              break;
          case "y":
              chars[i] = (Math.floor(Math.random() * 4) + 8).toString(16);
              break;
      }
  }
  return chars.join("");
}

let getIsDuplicate = function(arr1, arr2) {
  // https://www.dkrk-blog.net/javascript/duplicate_an_array
  return [...arr1, ...arr2].filter(item => arr1.includes(item) && arr2.includes(item)).length > 0
}

let htmlInitialize = function(){
  var txt_select = ''
  Object.keys(headerList).forEach(function(key){
    txt_select += '<option value="' + key + '">' + headerList[key] + '</option>\n'
  })
  $('#hide_column').html(txt_select)
  $('#hide_column').selectpicker('refresh')

  txt = ''
   unique_data.forEach((element) => {
     txt += '<option value="'+element+'">'+element+'</option>\n'
   })
   $('#delete_row_bulk').html(txt)
   $('#delete_row_bulk').selectpicker('refresh')
}

let changeHeader = function(){
  Object.keys(headerList).forEach(function(key){
    $('#table_header').find('.'+key).html(headerList[key])
  })
}
let dispLoading = function(msg){
  // 引数なし（メッセージなし）を許容
  if( msg == undefined ){
    msg = "";
  }
  // 画面表示メッセージ
  var dispMsg = "<div class='loadingMsg'>現在" + msg + "を処理中です</div>";
  // ローディング画像が表示されていない場合のみ出力
  if($("#loading").length == 0){
    $("body").append("<div id='loading'>" + dispMsg + "</div>");
  }
}

let removeLoading = function(){
  $("#loading").remove();
}

let test = function(){
  console.log('called')
  $.ajax({type:'post',url:'/api/v1/test/',
      success:function(j){
        full_data = $.extend(true,[],j.data)
        original = $.extend(true,[],j.data)
        headerList = {'ms_month':'月','ms_day':'日','ms_type1':'種別','ms_boarding_station':'利用駅','ms_type2':'種別','ms_gettingoff_station':'利用駅','ms_balance':'残額','ms_diff':'差額'}
        headerListOriginal = JSON.parse(JSON.stringify(headerList))
        unique_data = $.extend(true,[],j.unique)
        global_flag = {'init':'first'}
        htmlInitialize()
        Initialize_datatables()
      },
      error:function(j){
        console.log(j)
        alert(j['responseJSON']['error'])
      }
    })
}
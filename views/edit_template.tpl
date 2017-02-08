<h3 class="page-header">{{currentTemplate.name}} <small>{{currentTemplate.description}}</small></h3>

<h4>Aktif Departmanlar</h4>
<input type="text" value="" placeholder="Departman" name="new_department"/><button type="button" onclick="addDepartment()">+ Ekle</button>
<input type="hidden" value="{{currentTemplate.department}}" name="department" />
<div class="departments"></div>


<script id="template-department-item" type="text/x-handlebars-template">
    \{{#each departments}}
        <span class="label label-primary">\{{this}} <button onclick="removeDepartment('\{{this}}');"><span class="glyphicon glyphicon-remove text-danger"></span></button></span>
    \{{/each}}
</script>
<script>
    /*
    Remove Department
     */
    function removeDepartment(department) {
      var departments = $("input[name='department']").val().toString().trim().split(',');
      var index = departments.indexOf(department);
      if (index == -1) return;
      departments.splice(index, 1);
      $("input[name='department']").val(departments.join(','));
      $(".departments").html(Handlebars.compile($("#template-department-item").html())({departments}));
    }

    /*
     Add Department
     */
    function addDepartment() {
      var department = $("input[name='new_department']").val().toString().trim();
      if (!department) return;
      var departments = $("input[name='department']").val().toString().trim();
      departments = departments ? departments.split(',') : [];
      if (departments.indexOf(department) > -1) return;
      $("input[name='new_department']").val('');
      departments.push(department);
      $("input[name='department']").val(departments.join(','));
      $(".departments").html(Handlebars.compile($("#template-department-item").html())({departments}));
    }

    // Render Departments
    $(".departments").html(Handlebars.compile($("#template-department-item").html())({departments: $("input[name='department']").val().toString().trim().split(',')}));
</script>
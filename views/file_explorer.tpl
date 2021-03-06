<div class="files-loader">
	<div class="loader-body">
		<div class="spinner">
		  <div class="bounce1"></div>
		  <div class="bounce2"></div>
		  <div class="bounce3"></div>
		</div>
	</div>
</div>
<div class="container">
    <h3 class="page-header">
		Dosyalar
		<div class="option-buttons btn-group pull-right">
			<button data-role="create_folder" class="btn btn-default">Yeni klasör</button>
			<label class="btn btn-success btn-file">
				Dosya yükle <input id="fileupload" type="file" name="files[]" data-url="/files/upload" multiple />
			</label>
		</div>
		<div class="clearfix"></div>
	</h3>
    <ol class="breadcrumb" style="min-height:36px;font-size:16px;"></ol>
	<div class="panel panel-default" style="background-color:#f5f5f5;border:none;min-height:36px;">
		<div class="panel-body" style="padding-bottom:0;">
			<div class="file_explorer row"></div>
		</div>
	</div>
</div>

<link rel="stylesheet" type="text/css" href="/css/mime.css?t={{asset_cache}}" />
<script src="/assets/speakingurl/speakingurl.min.js?t={{asset_cache}}"></script>
<script src="/assets/blueimp-file-upload/js/vendor/jquery.ui.widget.js?t={{asset_cache}}"></script>
<script src="/assets/blueimp-file-upload/js/jquery.fileupload.js?t={{asset_cache}}"></script>
<script src="/assets/clipboard/dist/clipboard.min.js?t={{asset_cache}}"></script>
<script src="/assets/filesize/lib/filesize.min.js?t={{asset_cache}}"></script>
<script src="/assets/history.js/scripts/bundled/html5/jquery.history.js?t={{asset_cache}}"></script>
<script id="template-path-breadcrumb" type="text/x-handlebars-template">
	\{{#if paths}}
		<li><a data-path-href="" style="cursor:pointer">Root</a></li>
	\{{else}}
		<li class="active">Root</li>
	\{{/if}}
	\{{#each paths}}
		\{{#if @last}}
			<li class="active">\{{name}}</li>
		\{{else}}
			<li><a href data-path-href="/\{{link}}">\{{name}}</a></li>
		\{{/if}}
	\{{/each}}
</script>
<script id="template-files" type="text/x-handlebars-template">
  \{{#each dirs}}
  <div class="col-lg-2 col-md-2 col-sm-3 col-xs-6">
    <div class="thumbnail folder element" data-path="\{{path}}">
      <div class="option-buttons btn-group option-buttons">
        <button data-role="delete" data-path="\{{path}}" class="btn btn-sm btn-default btn-delete">Sil</button>
      </div>
      <div class="folder-container">
        <i class="fa fa-folder" style="font-size: 64px;"></i>
      </div>
      <div class="file-name" title="\{{title}}">\{{title}}</div>
      <div class="file-attr"><div class="file-size">dir</div></div>
    </div>
  </div>
  \{{/each}}
	\{{#each files}}
		<div class="col-lg-2 col-md-2 col-sm-3 col-xs-6">
			<div class="thumbnail file element" data-path="\{{name}}">
				<div class="option-buttons btn-group option-buttons">
					<button data-role="copy-image" class="btn btn-sm btn-default">Kopyala</button>
					<button data-role="delete" data-path="\{{name}}" class="btn btn-sm btn-default btn-delete">Sil</button>
				</div>
				<div class="file-container">
					<i class="fa mime ext-\{{ext}}" style="font-size: 64px;"></i>
				</div>
				<div class="file-name" title="\{{title}}">\{{title}}</div>
				<div class="file-attr ellipsis"><div class="file-size">\{{size}}</div></div>
			</div>
		</div>
	\{{/each}}
  \{{#unless has_object}}
    <div class="col-xs-12 text-muted" style="margin-bottom:15px;">Dosya bulunamadı</div>
  \{{/unless}}
	\{{#if token}}
		<div class="col-xs-12 text-center">
			<button data-role="load_more" data-cursor="\{{token}}" class="btn btn-link">Daha fazla yükle</button>
		</div>
	\{{/if}}
</script>
<script>

  $('#fileupload').fileupload({
    dataType: 'json',
    done: function (e, res) {
      if (res.result && res.result instanceof Array) {
        var _files = res.result.map(f => Object.assign(f, { size: filesize(f.size), ext: f.name.replace(/.*\.(\w+)/, '$1'), title: f.name.split(/\/+/).filter(p => p && p != "").pop()}));
        if ($(".file_explorer .element").length == 0) $(".file_explorer").html("");
        var _file = Handlebars.compile($('#template-files').html())({ files: _files, has_object: true });
        $(".file_explorer").append(_file).triggerHandler('loaded.template');
      }
    }
  });

	function loading(state) {
		if (typeof state == 'boolean') {
		  if ($('body').data('loading') !== state) $(".file_explorer").trigger(state ? 'loading.folder' : 'loaded.folder');
		  $('body').data('loading', state);
		}
		return $('body').data('loading');
	}

	$("[data-role='create_folder']").on('click', function () {
	  var folder = '';
	  if (!(folder = prompt('Klasör adı'))) return;
	  folder = getSlug(folder.trim().slice(0, 30), "_");
	  if (!folder) return;
	  if (folder.trim().indexOf('/') > -1) return;
	  folder = $(".file_explorer").data('path') + folder + '/';
	  $.post('/files/create_folder', { path: folder }).then(folder => {
	    var dirs = [ { title: folder.name.split(/\/+/).filter(p => p && p != "").pop(), path: folder.name } ];
      var _folder = Handlebars.compile($('#template-files').html())({ files: [], dirs, token: null, has_object: true});
      if ($(".file_explorer .element").length == 0) $(".file_explorer").html("");
      if ($(".file_explorer .folder").length > 0)
        $(".file_explorer .folder").last().parent().after(_folder);
      else
        $(".file_explorer").append(_folder);
      $(".file_explorer").triggerHandler('loaded.template');
	  }).catch(err => console.error(err));
	});

	var clipboard = null;

	$(".file_explorer")
	  .on('loading.folder', (e) => {
		$("body").addClass("files-loading");
		//console.log('loading');
	  })
	  .on('loaded.folder', (e) => {
		$("body").removeClass("files-loading");
		//console.log('loaded');
	  })
	  .on('loaded.template', (e) => {
      // Set base folder for file upload
      $('#fileupload').fileupload({ formData: { path: $(".file_explorer").data('path') } });

      // Folder click
      $('.folder').off('click').on('click', (e) => {
        if ($(e.target).attr('data-role') || $(e.target).closest('button').attr('data-role')) return e.preventDefault();
        var folder = $(e.currentTarget).attr('data-path');
            History.pushState({ folder }, "Dosyalar: " + folder, '/explorer/' + (folder ? folder.split(/\/+/).map(f => encodeURIComponent(f)).join('/') : ""));
      });

      // File click
      $('.file').off('click').on('click', (e) => {
        if ($(e.target).attr('data-role') || $(e.target).closest('button').attr('data-role')) return e.preventDefault();
        showFile($(e.currentTarget).attr('data-path'));
        $("body").triggerHandler('selected.file', $(e.currentTarget).attr('data-path'));
      });

      // Breadcrumb
      var paths = $(".file_explorer").data('path') ? $(".file_explorer").data('path').trim().split('/').filter(p => p && p != "") : [];
      paths = paths.map((p, i, items) => {
        return { name: p, link: items.slice(0, i + 1).join('/') };
      });
      $(".breadcrumb").html(Handlebars.compile($('#template-path-breadcrumb').html())({ paths }));
      $("[data-path-href]").off('click').on('click', function (e) {
        e.preventDefault();
            var folder = $(this).attr('data-path-href');
            History.pushState({ folder }, "Dosyalar: " + folder, '/explorer' + (folder ? folder.split(/\/+/).map(f => encodeURIComponent(f)).join('/') : ""));
      });

      // Load more
      $("[data-role='load_more']").off('click').on('click', function (e) {
        e.preventDefault();
        getFiles(null, $(this).attr('data-cursor'));
      });

      // Delete file
      $("[data-role='delete']").off('click').on('click', function (e) {
        e.preventDefault();
        if (!confirm('Emin misiniz?')) return;
        $(this).prop('disabled', true);
        var path = $(this).attr('data-path');
        $.post('/files/delete', { path }).then(r => {
          $("div[data-path='" + path + "']").parent().remove();
          if (!$(".file_explorer .element").length) $(".file_explorer").html(Handlebars.compile($('#template-files').html())({ files: [], dirs: [], token: null, has_object: false}));
        }).catch(err => console.error(err));
      });

      // Copy image files to clipboard
      if (clipboard) clipboard.destroy();
      $("[data-role='copy-image']").tooltip('destroy');
      clipboard = new Clipboard("[data-role='copy-image']", {
        text: function (trigger) {
              $(trigger).tooltip({ title: 'Kopyalandı', trigger: 'manual', placement: 'bottom', container: 'body' }).tooltip('show');
              setTimeout(() => {
                $(trigger).tooltip('hide');
        }, 700);
          return $(trigger).closest("[data-path]").attr('data-path');
            }
      });

      // Set Loaded true
      loading(false);
	  })
	  .on('change.path', (e, path) => {
      if (e.defaultPrevented) return;
      getFiles(path);
	  });

	function refresh() {
	  getFiles($(".file_explorer").data('path'));
	}

	function getFiles(path, token) {
	  if (loading()) return;
      loading(true);
      path = path || '';
      $.post('/files', Object.assign(token ? { token } : { path })).then(result => {
        var _files = result.files.map(f => Object.assign(f, { size: filesize(f.size), ext: f.name.replace(/.*\.(\w+)/, '$1'), title: f.name.split(/\/+/).filter(p => p && p != "").pop()}));
        var _dirs = (result.dirs || []).map(d => Object.assign({ title: d.split(/\/+/).filter(p => p && p != "").pop(), path: d }));
        var _token = result.token || null;
        if (!token) $(".file_explorer").html("");
        $(".file_explorer").data('path', path);
        $(".file_explorer")
          .append(Handlebars.compile($('#template-files').html())({ files: _files, dirs: _dirs, token: _token, has_object: !((!_dirs || _dirs.length == 0) && (!_files || _files.length == 0)) }))
          .trigger('loaded.template');
      }).catch(err => {
        console.error(err);
      });
	}

	function getLink(file) {
	  return new Promise((resolve) => {
      $.post('/files/link', { path: file }).then(data => resolve(data.url)).catch(err => resolve(null));
	  });
	}

	function showFile(path) {
	  getLink(path).then((url) => {
      var container = document.createElement('div');
      $(container).addClass('embed-responsive embed-responsive-4by3');
      var iframe = document.createElement('iframe');
      $(iframe).addClass('embed-responsive-item');
      $(container).append(iframe);
      $("#lightbox").find(".modal-header h4").html(path);
      $("#lightbox").find(".modal-body").html("").append(container);
      $("#lightbox").modal('show');
      iframe.src = url;
	  });
    }

	// Bind to StateChange Event
	History.Adapter.bind(window, 'statechange', function() {
		var _state = History.getState();
    $(".file_explorer").triggerHandler('change.path', _state.data.folder);
	});

	var _state = History.getState();

	getFiles(_state.hash.replace("/explorer", "").replace(/\?.*/, ''));
</script>
<div class="modal fade" id="lightbox" tabindex="-1" role="dialog">
	<div class="modal-dialog modal-lg" role="document">
		<div class="modal-content">
			<div class="modal-header">
				<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>
				<h4 class="modal-title" id="myModalLabel"></h4>
			</div>
			<div class="modal-body"></div>
		</div>
	</div>
</div>

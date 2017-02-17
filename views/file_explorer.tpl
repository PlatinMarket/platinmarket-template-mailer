<html>

</html><!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8" />
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Platinmarket Template Mailer</title>
    <link rel="stylesheet" type="text/css" href="/assets/bootstrap/dist/css/bootstrap.min.css" />
    <link rel="stylesheet" type="text/css" href="/assets/toastr/toastr.min.css" />
    <script type="application/javascript" src="/assets/jquery/dist/jquery.min.js"></script>
    <script type="application/javascript" src="/assets/bootstrap/dist/js/bootstrap.min.js"></script>
    <script type="application/javascript" src="/assets/handlebars/handlebars.min.js"></script>
    <script type="application/javascript" src="/assets/toastr/toastr.min.js"></script>
    <script>
      toastr.options = {
        closeButton: false,
        newestOnTop: true,
        showDuration: "50",
        hideDuration: "50",
        timeOut: "5000",
        showEasing: "linear",
        hideEasing: "linear",
        showMethod: "fadeIn",
        hideMethod: "fadeOut"
      };
    </script>
</head>
<body>
    <h3>Files</h3>
    <div class="breadcrumb"></div>
    <ul class="file_explorer"></ul>


    <script id="template-path-breadcrumb" type="text/x-handlebars-template">
        \{{#if paths}}
            <a data-path-href="" style="cursor:pointer">Kök dizin</a> /
        \{{else}}
            Kök dizin
        \{{/if}}
        \{{#each paths}}
            \{{#if @last}}
                \{{name}}
            \{{else}}
                <a data-path-href="/\{{link}}" style="cursor:pointer">\{{name}}</a> /
            \{{/if}}
        \{{/each}}
    </script>
    <script id="template-files" type="text/x-handlebars-template">
        \{{#each entries}}
            \{{#if isFile}}
                <li class="file">
                    <div class="thumbnail" style="width:128px; height:128px">
                        <img data-src="\{{path}}" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" />
                    </div>
                    \{{name}}
                </li>
            \{{/if }}
            \{{#if isFolder}}
                <li class="folder" data-path="\{{path}}">
                    <div class="thumbnail" style="width:128px; height:128px;text-align:center;">
                        <span class="glyphicon glyphicon-folder-close" style="font-size: 64px; line-height: 115px"></span>
                    </div>
                    \{{name}}
                </li>
            \{{/if }}
        \{{else}}
            Boş
        \{{/each}}
        \{{#if has_more}}
            <button onclick="getFiles(null, '\{{cursor}}')">Daha fazla yükle</button>
        \{{/if}}
    </script>
    <script>
        function loading(state) {
            if (typeof state == 'boolean') {
              if ($('body').data('loading') !== state) $("ul.file_explorer").trigger(state ? 'loading.folder' : 'loaded.folder');
              $('body').data('loading', state);
            }
            return $('body').data('loading');
        }

        $("ul.file_explorer")
          .on('loading.folder', (e) => {
            console.log('loading');
          })
          .on('loaded.folder', (e) => {
            console.log('loaded');
          })
          .on('loaded.template', (e) => {
            $('[data-src]').each(function () {
              var file = $(this).attr("data-src");
              $(this).removeAttr("data-src");
              getThumbnail(file).then(thumbnail => {
                $(this).attr('src', "data:image/jpg;base64," + btoa(thumbnail.fileBinary));
              });
            });
            $('li.folder').off('click').on('click', (e) => {
              $("ul.file_explorer").triggerHandler('change.path', $(e.currentTarget).attr('data-path'));
            });
            var paths = $("ul.file_explorer").data('path') ? $("ul.file_explorer").data('path').trim().slice(1).split('/') : [];
            paths = paths.map((p, i, items) => {
              return { name: p, link: items.slice(0, i + 1).join('/') };
            });
            $("div.breadcrumb").html(Handlebars.compile($('#template-path-breadcrumb').html())({ paths }));
            $("[data-path-href]").off('click').on('click', function (e) {
              e.preventDefault();
              $("ul.file_explorer").triggerHandler('change.path', $(this).attr('data-path-href'));
            });
            loading(false);
          })
          .on('change.path', (e, path) => {
            if (e.defaultPrevented) return;
            getFiles(path);
          });

        function getFiles(path, cursor) {
          if (loading()) return;
          loading(true);
          path = path || '';
          $.post('/files', cursor ? { cursor } : { path }).then(data => {
            data.entries = data.entries.filter(e => ['file', 'folder'].indexOf(e['.tag']) > -1).map(e => { return { id: e.id, name: e.name, type: e['.tag'], path: e.path_lower, isFile: e['.tag'] == 'file', isFolder: e['.tag'] == 'folder' }; });
            if (!cursor) $("ul.file_explorer").data('path', path);
            $("ul.file_explorer")
              .html(Handlebars.compile($('#template-files').html())(data))
              .trigger('loaded.template');
          });
        }

        function getThumbnail(file) {
          return new Promise((resolve, reject) => {
            if (!file) return reject(null);
            $.post('/files/thumbnail', { path: file }).then(data => resolve(data)).catch(err => resolve(null));
          });
        }

        getFiles();
    </script>
</body>
</html>
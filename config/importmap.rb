# Pin npm packages by running ./bin/importmap

pin "application"
pin "@hotwired/turbo-rails", to: "turbo.min.js"
pin "@hotwired/stimulus", to: "stimulus.min.js"
pin "@hotwired/stimulus-loading", to: "stimulus-loading.js"
pin_all_from "app/javascript/controllers", under: "controllers"
pin "@fullcalendar/core", to: "https://ga.jspm.io/npm:@fullcalendar/core@6.1.11/index.js"
pin "@fullcalendar/daygrid", to: "https://ga.jspm.io/npm:@fullcalendar/daygrid@6.1.11/index.js"

# 必要に応じて他のプラグインも追加
pin "@fullcalendar/interaction", to: "https://ga.jspm.io/npm:@fullcalendar/interaction@6.1.11/index.js"
pin "preact", to: "https://ga.jspm.io/npm:preact@10.22.1/dist/preact.module.js"
pin "preact/hooks", to: "https://ga.jspm.io/npm:preact@10.22.1/hooks/dist/hooks.module.js"
pin "preact/compat", to: "https://ga.jspm.io/npm:preact@10.22.1/compat/dist/compat.module.js" # ← この行を追加
pin "@fullcalendar/core", to: "https://ga.jspm.io/npm:@fullcalendar/core@6.1.11/index.js"
pin "@fullcalendar/core/index.js", to: "https://ga.jspm.io/npm:@fullcalendar/core@6.1.11/index.js" # ← この行を追加
pin "@fullcalendar/core/internal.js", to: "https://ga.jspm.io/npm:@fullcalendar/core@6.1.11/internal.js" # ← この行を追加
pin "@fullcalendar/core/preact.js", to: "https://ga.jspm.io/npm:@fullcalendar/core@6.1.11/preact.js"
pin "@fullcalendar/daygrid", to: "https://ga.jspm.io/npm:@fullcalendar/daygrid@6.1.11/index.js"
pin "@fullcalendar/timegrid", to: "https://ga.jspm.io/npm:@fullcalendar/timegrid@6.1.11/index.js"
pin "@fullcalendar/daygrid/internal.js", to: "https://ga.jspm.io/npm:@fullcalendar/daygrid@6.1.11/internal.js"
pin "@fullcalendar/multimonth", to: "https://ga.jspm.io/npm:@fullcalendar/multimonth@6.1.11/index.js"
pin "@fullcalendar/list", to: "https://ga.jspm.io/npm:@fullcalendar/list@6.1.11/index.js"
pin "bootstrap", to: "bootstrap.bundle.min.js"
pin "jquery", to: "/javascripts/jquery.js"

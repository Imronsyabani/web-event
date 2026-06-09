// Template default website builder (HTML ber-token).
// Owner bisa pakai apa adanya atau edit di mode advanced.
// Token diganti DATA saat render; {{events}}, {{ticket_list}}, {{buy_button}}
// adalah blok dinamis/widget (diganti komponen React).

const AURORA = {
  id: 'aurora',
  name: 'Aurora',
  css: `.site-hero{background:linear-gradient(135deg,var(--site-primary),#0984e3);color:#fff}
.site-card{transition:transform .2s} .site-card:hover{transform:translateY(-4px)}`,
  landingHtml: `<section class="site-hero py-5">
  <div class="container text-center py-5">
    <img src="{{workspace.logo}}" alt="logo" style="height:64px" class="rounded mb-3" />
    <h1 class="display-4 fw-bold">{{workspace.name}}</h1>
    <p class="lead mx-auto" style="max-width:640px">{{workspace.about}}</p>
  </div>
</section>
<section class="container py-5">
  <h2 class="fw-bold mb-4 text-center">Event Kami</h2>
  {{events}}
</section>`,
  eventHtml: `<section class="site-hero py-5">
  <div class="container py-4">
    <h1 class="fw-bold">{{event.name}}</h1>
    <p class="lead mb-0">{{event.date}} · {{event.venue.name}}</p>
  </div>
</section>
<section class="container py-5">
  <div class="row g-4">
    <div class="col-lg-8">
      <img src="{{event.banner}}" alt="banner" class="img-fluid rounded mb-4" />
      <h4>Deskripsi</h4>
      <p style="white-space:pre-line">{{event.description}}</p>
      <h5 class="mt-4">Lokasi</h5>
      <p>{{event.venue.name}} — {{event.venue.address}}</p>
    </div>
    <div class="col-lg-4">
      <div class="border rounded p-3">
        <h5>Tiket</h5>
        {{ticket_list}}
        {{buy_button}}
      </div>
    </div>
  </div>
</section>`,
}

const MINIMAL = {
  id: 'minimal',
  name: 'Minimal',
  css: `body{--bs-body-color:#1a1a1a} .site-line{border-top:4px solid var(--site-primary);width:64px}`,
  landingHtml: `<section class="container py-5 text-center">
  <div class="site-line mx-auto mb-4"></div>
  <h1 class="fw-bold">{{workspace.name}}</h1>
  <p class="text-muted mx-auto" style="max-width:560px">{{workspace.about}}</p>
</section>
<section class="container pb-5">
  {{events}}
</section>`,
  eventHtml: `<section class="container py-5">
  <div class="site-line mb-4"></div>
  <h1 class="fw-bold">{{event.name}}</h1>
  <p class="text-muted">{{event.date}} · {{event.venue.name}}</p>
  <img src="{{event.banner}}" alt="banner" class="img-fluid rounded my-4" />
  <div class="row g-4">
    <div class="col-lg-8"><p style="white-space:pre-line">{{event.description}}</p></div>
    <div class="col-lg-4">
      {{ticket_list}}
      {{buy_button}}
    </div>
  </div>
</section>`,
}

export const TEMPLATES = [AURORA, MINIMAL]

export const getTemplate = (id) =>
  TEMPLATES.find((t) => t.id === id) || TEMPLATES[0]

// Site default untuk workspace baru (mode template)
export function defaultSite(workspaceId, theme) {
  const t = TEMPLATES[0]
  return {
    workspaceId,
    mode: 'template',
    templateId: t.id,
    landingHtml: t.landingHtml,
    eventHtml: t.eventHtml,
    css: t.css,
    theme: theme || { primary: '#6c5ce7', font: 'Inter' },
    status: 'draft',
    publishedAt: null,
  }
}

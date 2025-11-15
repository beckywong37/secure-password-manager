from django.views.generic import TemplateView


class FrontendIndexView(TemplateView):
    template_name = "index.html"

package com.urlshortener.url_shortener.controller;

import com.urlshortener.url_shortener.dto.AnalyticsResponse;
import com.urlshortener.url_shortener.service.UrlShortenerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class AnalyticsController {
    private final UrlShortenerService urlShortenerService;

    @Autowired
    public AnalyticsController(UrlShortenerService urlShortenerService) {
        this.urlShortenerService = urlShortenerService;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        AnalyticsResponse analytics = new AnalyticsResponse();
        analytics.setTotalUrls(
                urlShortenerService.getTotalUrls());
        analytics.setTotalClicks(
                urlShortenerService.getTotalClicks());
        analytics.setActiveUrls(
                urlShortenerService.getActiveUrls());
        analytics.setExpiredUrls(
                urlShortenerService.getExpiredUrls());
        analytics.setTopUrls(
                urlShortenerService.getTopUrls());
        analytics.setAllUrls(
                urlShortenerService.getAllUrls());
        model.addAttribute("analytics", analytics);
        return "dashboard";
    }
}
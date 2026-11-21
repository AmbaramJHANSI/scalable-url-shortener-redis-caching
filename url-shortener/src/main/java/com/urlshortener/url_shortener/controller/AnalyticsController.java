package com.urlshortener.url_shortener.controller;

import com.urlshortener.url_shortener.dto.AnalyticsResponse;
import com.urlshortener.url_shortener.dto.ShortUrlRequest;
import com.urlshortener.url_shortener.service.QRCodeService;
import com.urlshortener.url_shortener.service.UrlShortenerService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.Base64;

@Controller
public class AnalyticsController {
    private final UrlShortenerService urlShortenerService;
    private final QRCodeService qrCodeService;

    @Autowired
    public AnalyticsController(
            UrlShortenerService urlShortenerService,
            QRCodeService qrCodeService) {
        this.urlShortenerService = urlShortenerService;
        this.qrCodeService = qrCodeService;
    }

    @GetMapping("/dashboard")
    public String dashboard(Model model) {
        model.addAttribute("shortUrlRequest", new ShortUrlRequest());
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
        model.addAttribute("now", LocalDateTime.now());
        model.addAttribute(
                "shortBaseUrl",
                ServletUriComponentsBuilder.fromCurrentContextPath().build().toUriString()
        );
        model.addAttribute(
                "averageClicksPerUrl",
                analytics.getTotalUrls() == 0
                        ? 0.0
                        : (double) analytics.getTotalClicks() / analytics.getTotalUrls()
        );
        return "dashboard";
    }

    @ResponseBody
    @GetMapping(value = "/dashboard/qr/{shortCode}", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> qrCode(@PathVariable String shortCode) {
        urlShortenerService.getAnalytics(shortCode);
        String shortUrl = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/{shortCode}")
                .buildAndExpand(shortCode)
                .toUriString();
        byte[] image = Base64.getDecoder().decode(qrCodeService.generateQRCode(shortUrl));

        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_PNG)
                .cacheControl(CacheControl.maxAge(Duration.ofHours(1)).cachePrivate())
                .body(image);
    }
}
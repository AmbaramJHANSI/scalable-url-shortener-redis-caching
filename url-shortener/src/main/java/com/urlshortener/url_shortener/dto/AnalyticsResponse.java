package com.urlshortener.url_shortener.dto;

import com.urlshortener.url_shortener.entity.ShortUrl;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalyticsResponse {
    // Dashboard Statistics
    private long totalUrls;
    private long totalClicks;
    private long activeUrls;
    private long expiredUrls;

    // Top 5 Most Visited URLs
    private List<ShortUrl> topUrls;

    // Complete URL History
    private List<ShortUrl> allUrls;
}
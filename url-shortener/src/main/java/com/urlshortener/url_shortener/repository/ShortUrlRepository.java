package com.urlshortener.url_shortener.repository;

import com.urlshortener.url_shortener.entity.ShortUrl;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShortUrlRepository extends JpaRepository<ShortUrl, Long> {
    Optional<ShortUrl> findByShortCode(String shortCode);

    Optional<ShortUrl> findByOriginalUrl(String originalUrl);

    List<ShortUrl> findAllByOrderByCreatedAtDesc();

    long count();

    List<ShortUrl> findTop5ByOrderByClickCountDesc();

    // ==============================
    // Dashboard Statistics
    // ==============================
    @Query("""
        SELECT COUNT(s)
        FROM ShortUrl s
        WHERE s.expiresAt IS NULL
           OR s.expiresAt > :now
    """)
    long countActiveUrls(@Param("now") LocalDateTime now);

    long countByExpiresAtBefore(LocalDateTime now);

    List<ShortUrl> findByShortCodeContainingIgnoreCase(String keyword);

    List<ShortUrl> findByOriginalUrlContainingIgnoreCase(String keyword);

    List<ShortUrl> findAllByOrderByClickCountDesc();

    List<ShortUrl> findAllByOrderByClickCountAsc();
}
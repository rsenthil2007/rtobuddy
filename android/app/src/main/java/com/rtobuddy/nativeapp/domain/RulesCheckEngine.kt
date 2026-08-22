package com.rtobuddy.nativeapp.domain

import com.rtobuddy.nativeapp.domain.model.RulesCheckEntry

object RulesCheckEngine {
    fun search(
        query: String,
        entries: List<RulesCheckEntry>,
        vehicleFilter: String? = null,
        limit: Int = 8,
    ): List<RulesCheckEntry> {
        val q = query.trim()
        if (q.length < 2) return emptyList()

        val tokens = tokenize(q)
        val filtered = entries.filter { entry ->
            when (vehicleFilter?.uppercase()) {
                "2W" -> entry.vehicle_types.any { it.equals("2W", ignoreCase = true) }
                "4W" -> entry.vehicle_types.any { it.equals("4W", ignoreCase = true) }
                else -> true
            }
        }

        return filtered
            .map { it to score(it, q, tokens) }
            .filter { (_, score) -> score > 0 }
            .sortedByDescending { (_, score) -> score }
            .take(limit)
            .map { (entry, _) -> entry }
    }

    private fun score(entry: RulesCheckEntry, rawQuery: String, tokens: List<String>): Int {
        var score = 0
        val haystack = buildString {
            append(entry.title)
            append(' ')
            append(entry.simple_rule)
            append(' ')
            append(entry.legal_reference)
            append(' ')
            entry.keywords.forEach { append(it).append(' ') }
        }.lowercase()

        val qLower = rawQuery.lowercase()
        if (entry.id.equals(qLower, ignoreCase = true)) score += 120
        if (entry.title.lowercase().contains(qLower)) score += 80
        if (entry.legal_reference.lowercase().contains(qLower)) score += 70
        if (haystack.contains(qLower)) score += 40

        tokens.forEach { token ->
            if (token.length < 2) return@forEach
            if (entry.keywords.any { it.equals(token, ignoreCase = true) }) score += 35
            if (entry.title.lowercase().contains(token)) score += 20
            if (entry.legal_reference.lowercase().contains(token)) score += 25
            if (entry.simple_rule.lowercase().contains(token)) score += 10
        }
        return score
    }

    private fun tokenize(query: String): List<String> =
        query.lowercase()
            .split(Regex("[\\s,;/]+"))
            .map { it.trim('.', '(', ')') }
            .filter { it.isNotBlank() }
}

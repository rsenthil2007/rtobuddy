package com.rtobuddy.nativeapp.data

import android.content.Context
import com.rtobuddy.nativeapp.domain.model.ExamQuestion
import com.rtobuddy.nativeapp.domain.model.JurisdictionInfo
import com.rtobuddy.nativeapp.domain.model.OfficialService
import com.rtobuddy.nativeapp.domain.model.RoadMarking
import com.rtobuddy.nativeapp.domain.model.RoadRule
import com.rtobuddy.nativeapp.domain.model.StateUtRule
import com.rtobuddy.nativeapp.domain.model.TrafficSign
import com.rtobuddy.nativeapp.domain.model.TrafficSignal
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonObject
import kotlinx.serialization.json.decodeFromJsonElement
import kotlinx.serialization.json.jsonObject

class AssetCatalog(context: Context) {
    private val assets = context.applicationContext.assets
    private val json = Json {
        ignoreUnknownKeys = true
        isLenient = true
    }

    val signs: List<TrafficSign> by lazy { read("data/common/traffic_signs.json", SignsFile.serializer()).signs }
    val signals: List<TrafficSignal> by lazy { read("data/common/traffic_signals.json", SignalsFile.serializer()).signals }
    val markings: List<RoadMarking> by lazy { read("data/common/road_markings.json", MarkingsFile.serializer()).markings }
    val rules: List<RoadRule> by lazy { read("data/common/rules.json", RulesFile.serializer()).rules }
    val questions: List<ExamQuestion> by lazy { read("data/common/mock_questions.json", QuestionsFile.serializer()).questions }
    val services: List<OfficialService> by lazy { read("data/common/official_services.json", ServicesFile.serializer()).services }

    private val overlaysRoot: JsonObject by lazy {
        json.parseToJsonElement(assets.open("data/common/jurisdiction_overlays.json").bufferedReader().use { it.readText() })
            .jsonObject["overlays"]?.jsonObject ?: JsonObject(emptyMap())
    }

    val jurisdictions: List<JurisdictionInfo> by lazy {
        overlaysRoot.keys.sorted().map { code ->
            JurisdictionInfo(code = code, name = JURISDICTION_NAMES[code] ?: code)
        }
    }

    fun stateRules(code: String): List<StateUtRule> {
        val node = overlaysRoot[code]?.jsonObject ?: return emptyList()
        val rulesNode = node["state_ut_rules"] ?: return emptyList()
        return json.decodeFromJsonElement(rulesNode)
    }

    fun signById(id: String?): TrafficSign? = id?.let { sid -> signs.firstOrNull { it.id == sid } }
    fun signalById(id: String?): TrafficSignal? = id?.let { sid -> signals.firstOrNull { it.id == sid } }
    fun markingById(id: String?): RoadMarking? = id?.let { mid -> markings.firstOrNull { it.id == mid } }

    private fun <T> read(path: String, deserializer: kotlinx.serialization.DeserializationStrategy<T>): T {
        val text = assets.open(path).bufferedReader().use { it.readText() }
        return json.decodeFromString(deserializer, text)
    }

    @Serializable
    private data class SignsFile(val signs: List<TrafficSign> = emptyList())

    @Serializable
    private data class SignalsFile(val signals: List<TrafficSignal> = emptyList())

    @Serializable
    private data class MarkingsFile(val markings: List<RoadMarking> = emptyList())

    @Serializable
    private data class RulesFile(val rules: List<RoadRule> = emptyList())

    @Serializable
    private data class QuestionsFile(val questions: List<ExamQuestion> = emptyList())

    @Serializable
    private data class ServicesFile(val services: List<OfficialService> = emptyList())

    companion object {
        val JURISDICTION_NAMES = mapOf(
            "AN" to "Andaman and Nicobar Islands",
            "AP" to "Andhra Pradesh",
            "AR" to "Arunachal Pradesh",
            "AS" to "Assam",
            "BR" to "Bihar",
            "CG" to "Chhattisgarh",
            "CH" to "Chandigarh",
            "DL" to "Delhi",
            "DN" to "Dadra and Nagar Haveli and Daman and Diu",
            "DNHDD" to "Dadra and Nagar Haveli and Daman and Diu",
            "GA" to "Goa",
            "GJ" to "Gujarat",
            "HP" to "Himachal Pradesh",
            "HR" to "Haryana",
            "JH" to "Jharkhand",
            "JK" to "Jammu and Kashmir",
            "KA" to "Karnataka",
            "KL" to "Kerala",
            "LA" to "Ladakh",
            "LD" to "Lakshadweep",
            "MH" to "Maharashtra",
            "ML" to "Meghalaya",
            "MN" to "Manipur",
            "MP" to "Madhya Pradesh",
            "MZ" to "Mizoram",
            "NL" to "Nagaland",
            "OD" to "Odisha",
            "PB" to "Punjab",
            "PY" to "Puducherry",
            "RJ" to "Rajasthan",
            "SK" to "Sikkim",
            "TN" to "Tamil Nadu",
            "TR" to "Tripura",
            "TS" to "Telangana",
            "UK" to "Uttarakhand",
            "UP" to "Uttar Pradesh",
            "WB" to "West Bengal",
        )
    }
}

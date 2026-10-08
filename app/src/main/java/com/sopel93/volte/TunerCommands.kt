package com.sopel93.volte

object TunerCommands {
    const val GRANT_SECURE = "pm grant com.sopel93.volte android.permission.WRITE_SECURE_SETTINGS"
    val SMART_5G_OFF = join(
        "settings put global smart_5g_switch 0",
        "settings put global smart_5g 0",
        "settings put system smart_5g_switch 0",
        "settings put system oplus_smart_5g 0",
        "settings put global oplus_customize_smart_5g_switch 0",
        "settings put secure smart_5g_enabled 0",
        "setprop persist.sys.oplus.radio.smart_5g 0",
    )
    val NETWORK_AUTO_5G = join(
        "settings put global preferred_network_mode 26",
        "settings put global preferred_network_mode1 26",
        "settings put global preferred_network_mode2 26",
        "settings put global hide_enable_5g 0",
    )
    val DATA_SAVER_OFF = join(
        "cmd netpolicy set-restrict-background false",
        "settings put global data_saver 0",
        "settings put global netstats_enabled 1",
    )
    val BATTERY_BALANCED = join(
        "settings put global low_power 0",
        "settings put global low_power_sticky 0",
        "dumpsys deviceidle whitelist +com.sopel93.volte",
    )
    const val MOBILE_ALWAYS_ON = "settings put global mobile_data_always_on 1"
    val VOLTE_ON = join(
        "settings put global volte_vt_enabled 1",
        "settings put global volt_vt_enabled 1",
        "settings put global vt_ims_enabled 1",
        "settings put global enhanced_4g_lte_mode 1",
    )
    val VOWIFI_ON = join(
        "settings put global wfc_ims_enabled 1",
        "settings put global wfc_ims_mode 1",
    )
    val RADIO_INFO = join(
        "am start -n com.android.phone/.settings.RadioInfo",
        "am start -n com.android.settings/.RadioInfo",
        "am start -a android.intent.action.MAIN -n com.android.settings/.Settings\$TestingSettingsActivity",
    )
    const val OPEN_SIM = "am start -a android.settings.NETWORK_OPERATOR_SETTINGS"
    const val OPEN_DATA_SAVER = "am start -a android.settings.DATA_SAVER_SETTINGS"
    const val OPEN_WIFI = "am start -a android.settings.WIFI_SETTINGS"
    const val OPEN_BATTERY = "am start -a android.settings.BATTERY_SAVER_SETTINGS"
    const val OPEN_APN = "am start -a android.settings.APN_SETTINGS"
    const val OPEN_PRIVATE_DNS = "am start -n com.android.settings/.Settings\$PrivateDnsSettingsActivity"
    const val APN_IPV4V6 = """content update --uri content://telephony/carriers --bind protocol:s:IPV4V6 --bind roaming_protocol:s:IPV4V6 --where "current=1""""
    fun privateDns(host: String) = join("settings put global private_dns_mode hostname","settings put global private_dns_specifier $host")
    const val DNS_OFF = "settings put global private_dns_mode off"
    fun insertApn(name:String, apn:String, mcc:String, mnc:String, user:String="", password:String=""):String {
        val numeric=mcc+mnc
        val userBind=if(user.isBlank()) "" else " --bind user:s:$user"
        val passBind=if(password.isBlank()) "" else " --bind password:s:$password"
        return """content insert --uri content://telephony/carriers --bind name:s:'$name' --bind apn:s:$apn --bind numeric:s:$numeric --bind mcc:s:$mcc --bind mnc:s:$mnc --bind type:s:'default,supl' --bind protocol:s:IPV4V6 --bind roaming_protocol:s:IPV4V6 --bind authtype:i:1 --bind carrier_enabled:i:1 --bind current:i:1$userBind$passBind ; $APN_IPV4V6"""
    }
    val APPLY_ALL=join(GRANT_SECURE,SMART_5G_OFF,NETWORK_AUTO_5G,DATA_SAVER_OFF,BATTERY_BALANCED,MOBILE_ALWAYS_ON,VOLTE_ON,APN_IPV4V6,privateDns("one.one.one.one"))
    private fun join(vararg parts:String)=parts.joinToString(" ; "){it.trim().trimEnd(';')}
}

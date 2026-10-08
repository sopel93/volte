package com.sopel93.volte

import android.content.Context
import android.os.Process
import android.util.Log
import java.io.BufferedReader

class ShellService : IShellService.Stub {
    constructor() { Log.i(TAG, "ShellService uid=${Process.myUid()}") }
    @Suppress("unused")
    constructor(context: Context) { Log.i(TAG, "ShellService(context) uid=${Process.myUid()}") }
    override fun destroy() { System.exit(0) }
    override fun exec(command: String): String {
        val process = Runtime.getRuntime().exec(arrayOf("sh", "-c", command))
        val stdout = process.inputStream.bufferedReader().use(BufferedReader::readText)
        val stderr = process.errorStream.bufferedReader().use(BufferedReader::readText)
        val code = process.waitFor()
        return buildString {
            append("exit=").append(code)
            if (stdout.isNotBlank()) append('\n').append(stdout.trimEnd())
            if (stderr.isNotBlank()) append("\n[stderr]\n").append(stderr.trimEnd())
        }
    }
    companion object { private const val TAG = "VOLT-Shell" }
}

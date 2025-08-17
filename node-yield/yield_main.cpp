#include <node_api.h>
#ifdef _WIN32
#include <thread>
#else
#include <unistd.h> // for usleep
#include <sched.h>  // for sched_yield
#endif

// Sleep function: blocks main thread for given milliseconds
napi_value SleepMain(napi_env env, napi_callback_info info) {
    size_t argc = 1;
    napi_value args[1];
    napi_get_cb_info(env, info, &argc, args, nullptr, nullptr);

    if (argc < 1) return nullptr; // no argument provided

    double ms = 0;
    napi_get_value_double(env, args[0], &ms);

#ifdef _WIN32
    std::this_thread::sleep_for(std::chrono::milliseconds(static_cast<int>(ms)));
#else
    usleep(static_cast<useconds_t>(ms * 1000)); // convert ms to microseconds
#endif

    return nullptr;
}

// Yield function: yields CPU back to OS
napi_value YieldMain(napi_env env, napi_callback_info info) {
#ifdef _WIN32
    std::this_thread::yield();
#else
    sched_yield();
#endif
    return nullptr;
}

napi_value Init(napi_env env, napi_value exports) {
    napi_value fn_sleep, fn_yield;

    napi_create_function(env, nullptr, 0, SleepMain, nullptr, &fn_sleep);
    napi_set_named_property(env, exports, "sleepMain", fn_sleep);

    napi_create_function(env, nullptr, 0, YieldMain, nullptr, &fn_yield);
    napi_set_named_property(env, exports, "yieldMain", fn_yield);

    return exports;
}

NAPI_MODULE(NODE_GYP_MODULE_NAME, Init)

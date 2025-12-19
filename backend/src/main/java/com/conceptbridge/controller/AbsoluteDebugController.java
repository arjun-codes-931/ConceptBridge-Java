package com.conceptbridge.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class AbsoluteDebugController {

    @GetMapping("/__whoami")
    public Map<String, Object> whoami(Authentication auth) {

        Map<String, Object> response = new HashMap<>();

        if (auth == null) {
            response.put("authenticated", false);
            response.put("username", null);
            response.put("authorities", null);
            return response;
        }

        response.put("authenticated", auth.isAuthenticated());
        response.put("principal", auth.getPrincipal());
        response.put("authorities", auth.getAuthorities());

        return response;
    }

}

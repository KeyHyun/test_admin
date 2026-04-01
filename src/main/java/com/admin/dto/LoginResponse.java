package com.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private String username;
    private String name;
    private String role;

    public LoginResponse(String accessToken, String username, String name, String role) {
        this.accessToken = accessToken;
        this.username = username;
        this.name = name;
        this.role = role;
    }
}

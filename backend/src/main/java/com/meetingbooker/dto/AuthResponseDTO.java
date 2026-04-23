package com.meetingbooker.dto;

public class AuthResponseDTO {

    private String token;
    private String username;
    private String name;
    private String email;
    private String role;

    public AuthResponseDTO() {}

    public AuthResponseDTO(String token, String username, String name, String email, String role) {
        this.token = token;
        this.username = username;
        this.name = name;
        this.email = email;
        this.role = role;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }
}

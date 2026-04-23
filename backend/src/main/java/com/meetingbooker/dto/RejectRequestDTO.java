package com.meetingbooker.dto;

import jakarta.validation.constraints.NotBlank;

public class RejectRequestDTO {

    @NotBlank(message = "拒绝原因不能为空")
    private String rejectReason;

    public String getRejectReason() {
        return rejectReason;
    }

    public void setRejectReason(String rejectReason) {
        this.rejectReason = rejectReason;
    }
}

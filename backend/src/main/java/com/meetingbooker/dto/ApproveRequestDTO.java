package com.meetingbooker.dto;

import jakarta.validation.constraints.NotBlank;

public class ApproveRequestDTO {

    @NotBlank(message = "审批人姓名不能为空")
    private String approvedBy;

    public String getApprovedBy() {
        return approvedBy;
    }

    public void setApprovedBy(String approvedBy) {
        this.approvedBy = approvedBy;
    }
}

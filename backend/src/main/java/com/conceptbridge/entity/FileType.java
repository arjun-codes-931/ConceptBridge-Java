package com.conceptbridge.entity;

public enum FileType {
    PDF("application/pdf"),
    DOC("application/msword"),
    DOCX("application/vnd.openxmlformats-officedocument.wordprocessingml.document"),
    PPT("application/vnd.ms-powerpoint"),
    PPTX("application/vnd.openxmlformats-officedocument.presentationml.presentation"),
    TXT("text/plain"),
    IMAGE("image/*"),
    OTHER("application/octet-stream");

    private final String mimeType;

    FileType(String mimeType) {
        this.mimeType = mimeType;
    }

    public String getMimeType() {
        return mimeType;
    }

    public static FileType fromMimeType(String mimeType) {
        for (FileType type : values()) {
            if (type.mimeType.equals(mimeType)) {
                return type;
            }
        }
        return OTHER;
    }
}
package com.admin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // 확장자 없는 경로(SPA 라우트)를 index.html로 포워딩
    // /api/**, /h2-console/** 은 Spring Security 레벨에서 이미 분리됨
    @RequestMapping(value = { "/{path:[^\\.]*}", "/{path:[^\\.]*}/**" })
    public String forward() {
        return "forward:/index.html";
    }
}

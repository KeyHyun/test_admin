package com.admin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // /api/** 와 정적 파일(확장자 있는 경로) 제외한 모든 경로를 index.html로 포워딩
    @RequestMapping(value = { "/", "/{path:^(?!api|h2-console)[^\\.]*}", "/{path:^(?!api|h2-console)[^\\.]*}/**" })
    public String forward() {
        return "forward:/index.html";
    }
}

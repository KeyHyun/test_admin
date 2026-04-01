package com.admin.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class SpaController {

    // assets, api, h2-console, 파일 확장자(.xxx) 는 제외하고 나머지 SPA 경로만 index.html로 포워딩
    @RequestMapping(value = {
        "/{path:^(?!assets|api|h2-console)[^\\.]*}",
        "/{path:^(?!assets|api|h2-console)[^\\.]*}/**"
    })
    public String forward() {
        return "forward:/index.html";
    }
}

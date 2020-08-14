package br.com.lucasromagnoli.pocspringsocketjs.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.user.SimpUserRegistry;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

@Controller
@RequestMapping("/general")
public class GeneralController {

    @Autowired
    SimpUserRegistry simpUserRegistry;

    @ResponseBody
    @GetMapping
    public String conexoes() {
        return ""+simpUserRegistry.getUserCount();
    }
}

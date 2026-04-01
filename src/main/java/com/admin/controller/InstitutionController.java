package com.admin.controller;

import com.admin.dto.InstitutionRequest;
import com.admin.dto.InstitutionResponse;
import com.admin.entity.Institution;
import com.admin.service.InstitutionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/institutions")
@RequiredArgsConstructor
public class InstitutionController {

    private final InstitutionService institutionService;

    @GetMapping
    public ResponseEntity<Page<InstitutionResponse>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Institution.Status status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        return ResponseEntity.ok(institutionService.search(keyword, status, pageable));
    }

    @GetMapping("/group-codes")
    public ResponseEntity<List<String>> getGroupCodes() {
        return ResponseEntity.ok(institutionService.getGroupCodes());
    }

    @GetMapping("/{id}")
    public ResponseEntity<InstitutionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(institutionService.getById(id));
    }

    @PostMapping
    public ResponseEntity<InstitutionResponse> create(@Valid @RequestBody InstitutionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(institutionService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<InstitutionResponse> update(@PathVariable Long id,
                                                       @Valid @RequestBody InstitutionRequest request) {
        return ResponseEntity.ok(institutionService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        institutionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
    }
}

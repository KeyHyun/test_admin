package com.admin.repository;

import com.admin.entity.Institution;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface InstitutionRepository extends JpaRepository<Institution, Long> {

    boolean existsByCode(String code);

    @Query("SELECT DISTINCT i.groupCode FROM Institution i WHERE i.groupCode IS NOT NULL AND i.groupCode <> '' ORDER BY i.groupCode")
    List<String> findDistinctGroupCodes();

    @Query("SELECT i FROM Institution i WHERE " +
           "(:keyword IS NULL OR i.name LIKE %:keyword% OR i.code LIKE %:keyword% OR i.groupCode LIKE %:keyword%) AND " +
           "(:status IS NULL OR i.status = :status)")
    Page<Institution> search(
            @Param("keyword") String keyword,
            @Param("status") Institution.Status status,
            Pageable pageable
    );
}

package com.tirbuson.repository;

import com.tirbuson.model.Summary;
import org.springframework.stereotype.Repository;

@Repository
public interface SummaryRepository extends BaseRepository<Summary, Integer> {
    Summary findByPostId(Integer postId);

}
